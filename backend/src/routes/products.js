import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authRequired, requireRole } from '../middleware/auth.js';

export const productsRouter = Router();

function parseJsonArray(value, fallback) {
  if (typeof value !== 'string') return fallback;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function normalizeProduct(p) {
  const images = parseJsonArray(p.imagesJson, [p.image]);
  const colors = parseJsonArray(p.colorsJson, []);
  const sizes = parseJsonArray(p.sizesJson, []);

  // Keep frontend-compatible keys: images/colors/sizes
  // and omit internal *Json fields.
  // eslint-disable-next-line no-unused-vars
  const { imagesJson, colorsJson, sizesJson, ...rest } = p;
  return { ...rest, images, colors, sizes };
}

productsRouter.get('/countries', asyncHandler(async (req, res) => {
  const countries = await prisma.country.findMany({ orderBy: { id: 'asc' } });
  res.json({ countries });
}));

productsRouter.get('/categories', asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({ orderBy: { id: 'asc' } });
  res.json({ categories });
}));

productsRouter.get('/products', asyncHandler(async (req, res) => {
  //console.log(req.query)
  const querySchema = z.object({
    category: z.string().optional(),
    q: z.string().optional(),
    minPrice: z.coerce.number().int().optional(),
    maxPrice: z.coerce.number().int().optional(),
    colors: z.string().optional(),
    sizes: z.string().optional(),
    sort: z.enum(['latest', 'price_asc', 'price_desc']).optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  });
  
  const q = querySchema.parse(req.query);
  const page = q.page ?? 1;
  const limit = q.limit ?? 24;

  const colors = q.colors ? q.colors.split(',').map(s => s.trim()).filter(Boolean) : [];
  const sizes = q.sizes ? q.sizes.split(',').map(s => s.trim()).filter(Boolean) : [];

  const where = {
    ...(q.category ? { categorySlug: q.category } : {}),
    ...(q.q
      ? {
          OR: [
            { name: { contains: q.q } },
            { description: { contains: q.q } },
          ],
        }
      : {}),
    ...(q.minPrice != null || q.maxPrice != null
      ? {
          price: {
            ...(q.minPrice != null ? { gte: q.minPrice } : {}),
            ...(q.maxPrice != null ? { lte: q.maxPrice } : {}),
          },
        }
      : {}),
  };

  const orderBy =
    q.sort === 'price_asc'
      ? { price: 'asc' }
      : q.sort === 'price_desc'
      ? { price: 'desc' }
      : { createdAt: 'desc' };

  // SQLite JSON filtering support is limited; filter colors/sizes in JS.
  const baseItemsRaw = await prisma.product.findMany({ where, orderBy });
  const baseItems = baseItemsRaw.map(normalizeProduct);

  const filtered = baseItems.filter((p) => {
    const productColors = Array.isArray(p.colors) ? p.colors : [];
    const productSizes = Array.isArray(p.sizes) ? p.sizes : [];

    const colorOk = colors.length === 0 || colors.some(c => productColors.includes(c));
    const sizeOk = sizes.length === 0 || sizes.some(s => productSizes.includes(s));
    return colorOk && sizeOk;
  });

  const total = filtered.length;
  const items = filtered.slice((page - 1) * limit, page * limit);
  res.json({
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}));

productsRouter.get('/products/:id', asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const productRaw = await prisma.product.findUnique({ where: { id } });
  const product = productRaw ? normalizeProduct(productRaw) : null;
  if (!product) return res.status(404).json({ error: { message: 'Product not found' } });
  res.json({ product });
}));

const productCreateSchema = z.object({
  name: z.string().min(1),
  categorySlug: z.string().min(1),
  price: z.coerce.number().int().min(0),
  originalPrice: z.coerce.number().int().min(0).optional(),
  image: z.string().min(1),
  images: z.array(z.string().min(1)).optional(),
  sale: z.boolean().optional(),
  discount: z.coerce.number().int().min(0).optional(),
  colors: z.array(z.string().min(1)).optional(),
  sizes: z.array(z.string().min(1)).optional(),
  fabric: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
});

const productUpdateSchema = productCreateSchema.partial();

function serializeArray(value) {
  return JSON.stringify(Array.isArray(value) ? value : []);
}

function buildCreatePayload(data) {
  return {
    name: data.name,
    categorySlug: data.categorySlug,
    price: data.price,
    originalPrice: data.originalPrice ?? null,
    image: data.image,
    imagesJson: serializeArray(data.images ?? []),
    sale: data.sale ?? false,
    discount: data.discount ?? 0,
    colorsJson: serializeArray(data.colors ?? []),
    sizesJson: serializeArray(data.sizes ?? []),
    fabric: data.fabric ?? null,
    description: data.description ?? null,
  };
}

function buildUpdatePayload(data) {
  const payload = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.categorySlug !== undefined) payload.categorySlug = data.categorySlug;
  if (data.price !== undefined) payload.price = data.price;
  if (data.originalPrice !== undefined) payload.originalPrice = data.originalPrice ?? null;
  if (data.image !== undefined) payload.image = data.image;
  if (data.images !== undefined) payload.imagesJson = serializeArray(data.images);
  if (data.sale !== undefined) payload.sale = data.sale;
  if (data.discount !== undefined) payload.discount = data.discount;
  if (data.colors !== undefined) payload.colorsJson = serializeArray(data.colors);
  if (data.sizes !== undefined) payload.sizesJson = serializeArray(data.sizes);
  if (data.fabric !== undefined) payload.fabric = data.fabric ?? null;
  if (data.description !== undefined) payload.description = data.description ?? null;
  return payload;
}

productsRouter.post('/products', authRequired, requireRole('ADMIN'), asyncHandler(async (req, res) => {
  const parsed = productCreateSchema.parse(req.body);
  const product = await prisma.product.create({ data: buildCreatePayload(parsed) });
  res.status(201).json({ product: normalizeProduct(product) });
}));

productsRouter.patch('/products/:id', authRequired, requireRole('ADMIN'), asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: { message: 'Product not found' } });
  const parsed = productUpdateSchema.parse(req.body);
  const updated = await prisma.product.update({ where: { id }, data: buildUpdatePayload(parsed) });
  res.json({ product: normalizeProduct(updated) });
}));

productsRouter.delete('/products/:id', authRequired, requireRole('ADMIN'), asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const deleted = await prisma.product.delete({ where: { id } });
  res.json({ product: normalizeProduct(deleted) });
}));
