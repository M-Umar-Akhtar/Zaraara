import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authOptional, authRequired } from '../middleware/auth.js';
import { badRequest, forbidden, notFound } from '../utils/httpErrors.js';
import { generateOrderNumber } from '../utils/orderNumber.js';

export const ordersRouter = Router();

const createOrderSchema = z.object({
  customer: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
  }),
  shippingAddress: z.object({
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().optional(),
    postalCode: z.string().min(1),
    countryCode: z.string().min(2).max(3),
  }),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().positive(),
        selectedSize: z.string().optional(),
        selectedColor: z.string().optional(),
      })
    )
    .min(1),
});

ordersRouter.post('/orders', authOptional, asyncHandler(async (req, res) => {
  const body = createOrderSchema.parse(req.body);

  const productIds = [...new Set(body.items.map(i => i.productId))];
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  if (products.length !== productIds.length) throw badRequest('One or more products not found');

  const productById = new Map(products.map(p => [p.id, p]));

  const orderItems = body.items.map((item) => {
    const product = productById.get(item.productId);
    const unitPrice = product.price;
    const lineTotal = unitPrice * item.quantity;
    return {
      productId: item.productId,
      quantity: item.quantity,
      unitPrice,
      lineTotal,
      selectedSize: item.selectedSize,
      selectedColor: item.selectedColor,
    };
  });

  const subtotal = orderItems.reduce((sum, i) => sum + i.lineTotal, 0);
  const discount = 0;
  const shipping = subtotal >= 5000 ? 0 : 250;
  const total = subtotal - discount + shipping;

  // Ensure unique order number (retry a few times)
  let orderNumber = generateOrderNumber();
  for (let i = 0; i < 5; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const exists = await prisma.order.findUnique({ where: { orderNumber } });
    if (!exists) break;
    orderNumber = generateOrderNumber();
  }

  const created = await prisma.order.create({
    data: {
      orderNumber,
      userId: req.user?.sub ?? null,
      subtotal,
      discount,
      shipping,
      total,
      customerName: body.customer.name,
      customerEmail: body.customer.email.toLowerCase(),
      customerPhone: body.customer.phone,
      shipLine1: body.shippingAddress.line1,
      shipLine2: body.shippingAddress.line2,
      shipCity: body.shippingAddress.city,
      shipState: body.shippingAddress.state,
      shipPostal: body.shippingAddress.postalCode,
      shipCountryCode: body.shippingAddress.countryCode.toUpperCase(),
      items: { create: orderItems },
    },
    include: { items: true },
  });

  const estimatedDeliveryDate = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString();

  res.status(201).json({
    order: {
      orderNumber: created.orderNumber,
      status: created.status,
      currency: created.currency,
      subtotal: created.subtotal,
      discount: created.discount,
      shipping: created.shipping,
      total: created.total,
      createdAt: created.createdAt,
      estimatedDeliveryDate,
      items: created.items,
    },
  });
}));

ordersRouter.get('/orders/:orderNumber', authOptional, asyncHandler(async (req, res) => {
  const { orderNumber } = req.params;

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: { include: { product: true } } },
  });
  if (!order) throw notFound('Order not found');

  // Authorization:
  // - If order belongs to a user: require same user or support/admin
  // - If guest order: require matching email in query param
  if (order.userId) {
    const requesterId = req.user?.sub;
    const requesterRole = req.user?.role;
    const isOwner = requesterId && requesterId === order.userId;
    const isPrivileged = requesterRole === 'ADMIN' || requesterRole === 'SUPPORT';
    if (!isOwner && !isPrivileged) throw forbidden('Not allowed to view this order');
  } else {
    const email = (req.query.email ?? '').toString().toLowerCase();
    if (!email || email !== order.customerEmail) throw forbidden('Email verification required');
  }

  res.json({ order });
}));

ordersRouter.get('/me/orders', authRequired, asyncHandler(async (req, res) => {
  
  const orders = await prisma.order.findMany({
    where: { userId: req.user.sub },
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  });
  console.log(orders)
  res.json({ orders });
}));

ordersRouter.post('/orders/:orderNumber/confirm-delivery', authRequired, asyncHandler(async (req, res) => {
  const { orderNumber } = req.params;

  const order = await prisma.order.findUnique({ where: { orderNumber } });
  if (!order) throw notFound('Order not found');

  if (order.userId !== req.user.sub) {
    throw forbidden('You can only confirm deliveries for your own orders');
  }

  if (order.status !== 'SHIPPED') {
    throw badRequest('Order must be shipped before it can be marked as delivered');
  }

  const updated = await prisma.order.update({
    where: { orderNumber },
    data: {
      status: 'DELIVERED',
      deliveredAt: new Date(),
      supportLogs: {
        create: {
          actorUserId: req.user.sub,
          action: 'CUSTOMER_CONFIRM_DELIVERY',
          detailsJson: JSON.stringify({ confirmedAt: new Date().toISOString() }),
        },
      },
    },
  });

  res.json({ order: { orderNumber: updated.orderNumber, status: updated.status } });
}));
