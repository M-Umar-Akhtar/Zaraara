import rateLimit from 'express-rate-limit';

// Generic API limiter
export const apiRateLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000),
  max: Number(process.env.RATE_LIMIT_MAX ?? 300),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
});

// Tighter limiter for support endpoints
export const supportRateLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_SUPPORT_WINDOW_MS ?? 60_000),
  max: Number(process.env.RATE_LIMIT_SUPPORT_MAX ?? 60),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
});
