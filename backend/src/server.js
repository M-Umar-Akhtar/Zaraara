import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import { productsRouter } from './routes/products.js';
import { authRouter } from './routes/auth.js';
import { ordersRouter } from './routes/orders.js';
import { supportRouter } from './routes/support.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));

const corsOrigin = process.env.CORS_ORIGIN?.split(',').map(s => s.trim()).filter(Boolean);
app.use(
  cors({
    origin: corsOrigin?.length ? corsOrigin : true,
    credentials: true,
  })
);

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'techfy-backend' });
});

app.use('/api', productsRouter);
app.use('/api', authRouter);
app.use('/api', ordersRouter);
app.use('/api', supportRouter);

app.use((req, res) => {
  res.status(404).json({ error: { message: 'Route not found' } });
});

app.use(errorHandler);

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port}`);
});
