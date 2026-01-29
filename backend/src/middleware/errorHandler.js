import { HttpError } from '../utils/httpErrors.js';

export function errorHandler(err, req, res, next) {
  const status = err instanceof HttpError ? err.status : 500;

  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(status).json({
    error: {
      message: err.message ?? 'Internal server error',
      details: err.details ?? undefined,
    },
  });
}
