import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authRequired } from '../middleware/auth.js';
import { badRequest } from '../utils/httpErrors.js';

export const authRouter = Router();

function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' }
  );
}

function safeUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone ?? null };
}

authRouter.post('/auth/signup', asyncHandler(async (req, res) => {
  const bodySchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(4),
    phone: z.string().optional().nullable(),
  });

  const body = bodySchema.parse(req.body);
  const existing = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
  if (existing) throw badRequest('Email already in use');
  const passwordHash = await bcrypt.hash(body.password, 10);
  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email.toLowerCase(),
      passwordHash,
      phone: body.phone,
      role: 'CUSTOMER',
    },
  });

  const accessToken = signToken(user);
  res.status(201).json({ user: safeUser(user), accessToken });
}));

authRouter.post('/auth/admin/signup', asyncHandler(async (req, res) => {
  const bodySchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    adminSecret: z.string().min(6),
  });

  const body = bodySchema.parse(req.body);
  const secret = process.env.ADMIN_REGISTRATION_SECRET;
  if (!secret) {
    throw badRequest('Admin registration is not enabled');
  }

  if (body.adminSecret !== secret) {
    throw badRequest('Invalid admin registration secret');
  }

  const existing = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
  if (existing) throw badRequest('Email already in use');

  const passwordHash = await bcrypt.hash(body.password, 10);

  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email.toLowerCase(),
      passwordHash,
      role: 'ADMIN',
    },
  });

  const accessToken = signToken(user);
  res.status(201).json({ user: safeUser(user), accessToken });
}));

authRouter.post('/auth/login', asyncHandler(async (req, res) => {
  const bodySchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
  });

  const body = bodySchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
  if (!user) throw badRequest('Invalid credentials');

  const ok = await bcrypt.compare(body.password, user.passwordHash);
  if (!ok) throw badRequest('Invalid credentials');

  const accessToken = signToken(user);
  res.json({ user: safeUser(user), accessToken });
}));

authRouter.get('/me', authRequired, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
  if (!user) throw badRequest('User not found');
  res.json({ user: safeUser(user) });
}));
