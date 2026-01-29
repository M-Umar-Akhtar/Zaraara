import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authRequired, requireRole } from '../middleware/auth.js';
import { supportRateLimiter } from '../middleware/rateLimit.js';
import * as warehouse from '../integrations/warehouse.js';
import { badRequest, notFound, forbidden } from '../utils/httpErrors.js';

export const supportRouter = Router();

supportRouter.use(authRequired, requireRole('ADMIN', 'SUPPORT'));
supportRouter.use(supportRateLimiter);

const orderListSchema = z.object({
  q: z.string().min(1).optional(),
  status: z.enum(['PLACED', 'PACKING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

supportRouter.get('/support/orders', asyncHandler(async (req, res) => {
  const params = orderListSchema.parse(req.query);

  const where = {
    ...(params.status ? { status: params.status } : {}),
    ...(params.q
      ? {
          OR: [
            { orderNumber: { contains: params.q, mode: 'insensitive' } },
            { customerName: { contains: params.q, mode: 'insensitive' } },
            { customerEmail: { contains: params.q, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const total = await prisma.order.count({ where });
  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip: (params.page - 1) * params.limit,
    take: params.limit,
    include: { items: { include: { product: true } } },
  });

  const formatted = orders.map((order) => ({
    orderNumber: order.orderNumber,
    status: order.status,
    createdAt: order.createdAt,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    total: order.total,
    subtotal: order.subtotal,
    shipping: order.shipping,
    itemsCount: order.items.length,
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
      selectedColor: item.selectedColor,
      selectedSize: item.selectedSize,
      product: item.product
        ? {
            id: item.product.id,
            name: item.product.name,
            image: item.product.image,
          }
        : null,
    })),
  }));

  res.json({
    orders: formatted,
    page: params.page,
    limit: params.limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / params.limit)),
  });
}));

supportRouter.get('/support/orders/lookup', asyncHandler(async (req, res) => {
  const querySchema = z.object({
    orderNumber: z.string().min(3),
    email: z.string().email().optional(),
  });

  const q = querySchema.parse(req.query);

  const order = await prisma.order.findUnique({
    where: { orderNumber: q.orderNumber },
    include: { items: { include: { product: true } }, supportLogs: true },
  });
  if (!order) throw notFound('Order not found');

  if (q.email && q.email.toLowerCase() !== order.customerEmail) {
    throw forbidden('Email does not match order');
  }

  res.json({ order });
}));

supportRouter.patch('/support/orders/:orderNumber/address', asyncHandler(async (req, res) => {
  const paramsSchema = z.object({ orderNumber: z.string().min(3) });
  const bodySchema = z.object({
    shippingAddress: z.object({
      line1: z.string().min(1),
      line2: z.string().optional(),
      city: z.string().min(1),
      state: z.string().optional(),
      postalCode: z.string().min(1),
      countryCode: z.string().min(2).max(3),
    }),
    reason: z.string().optional(),
  });

  const { orderNumber } = paramsSchema.parse(req.params);
  const body = bodySchema.parse(req.body);

  const order = await prisma.order.findUnique({ where: { orderNumber } });
  if (!order) throw notFound('Order not found');

  if (order.status === 'SHIPPED' || order.status === 'DELIVERED') {
    throw badRequest('Address can no longer be changed: order already shipped');
  }

  const updated = await prisma.order.update({
    where: { orderNumber },
    data: {
      shipLine1: body.shippingAddress.line1,
      shipLine2: body.shippingAddress.line2,
      shipCity: body.shippingAddress.city,
      shipState: body.shippingAddress.state,
      shipPostal: body.shippingAddress.postalCode,
      shipCountryCode: body.shippingAddress.countryCode.toUpperCase(),
      supportLogs: {
        create: {
          actorUserId: req.user.sub,
          action: 'CHANGE_ADDRESS',
          detailsJson: JSON.stringify({
            reason: body.reason ?? null,
            updatedAt: new Date().toISOString(),
          }),
        },
      },
    },
  });

  // Notify warehouse / WMS of label update (stubbed integration)
  let warehouseResult = null;
  try {
    warehouseResult = await warehouse.updateShippingLabel(orderNumber, body.shippingAddress);
  } catch (e) {
    // No-op on integration failure; logged via support action
  }

  res.json({
    order: {
      orderNumber: updated.orderNumber,
      status: updated.status,
      shipLine1: updated.shipLine1,
      shipLine2: updated.shipLine2,
      shipCity: updated.shipCity,
      shipState: updated.shipState,
      shipPostal: updated.shipPostal,
      shipCountryCode: updated.shipCountryCode,
      updatedAt: updated.updatedAt,
      warehouse: warehouseResult,
    },
  });
}));

supportRouter.patch('/support/orders/:orderNumber/status', asyncHandler(async (req, res) => {
  const paramsSchema = z.object({ orderNumber: z.string().min(3) });
  const bodySchema = z.object({
    status: z.enum(['PLACED', 'PACKING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
    reason: z.string().optional(),
  });

  const { orderNumber } = paramsSchema.parse(req.params);
  const body = bodySchema.parse(req.body);

  const order = await prisma.order.findUnique({ where: { orderNumber } });
  if (!order) throw notFound('Order not found');

  const updated = await prisma.order.update({
    where: { orderNumber },
    data: {
      status: body.status,
      shippedAt: body.status === 'SHIPPED' ? new Date() : order.shippedAt,
      deliveredAt: body.status === 'DELIVERED' ? new Date() : order.deliveredAt,
      supportLogs: {
        create: {
          actorUserId: req.user.sub,
          action: 'UPDATE_STATUS',
          detailsJson: JSON.stringify({ status: body.status, reason: body.reason ?? null }),
        },
      },
    },
  });

  // Push status to warehouse / WMS (stubbed integration)
  try {
    await warehouse.pushStatus(orderNumber, body.status);
  } catch (e) {
    // ignore integration failures for now
  }

  res.json({ order: { orderNumber: updated.orderNumber, status: updated.status } });
}));
