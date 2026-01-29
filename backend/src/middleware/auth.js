import jwt from 'jsonwebtoken';
import { unauthorized, forbidden } from '../utils/httpErrors.js';

function getTokenFromReq(req) {
  const header = req.headers.authorization;
  if (!header) return null;
  const [type, token] = header.split(' ');
  if (type !== 'Bearer' || !token) return null;
  return token;
}

export function authOptional(req, res, next) {
  const token = getTokenFromReq(req);
  if (!token) return next();

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return next();
  }
}

export function authRequired(req, res, next) {
  const token = getTokenFromReq(req);
  if (!token) return next(unauthorized());

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return next(unauthorized('Invalid or expired token'));
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(forbidden('Insufficient permissions'));
    }
    return next();
  };
}
