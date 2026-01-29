# Techfy E-Commerce Backend

Express + Prisma (SQLite) backend for the Techfy fashion e-commerce frontend.

## Quick start

1) Install deps

```bash
npm --prefix backend install
```

2) Create DB + seed

```bash
npm --prefix backend run migrate
npm --prefix backend run seed
```

3) Run API

```bash
npm --prefix backend run dev
```

API base URL: `http://localhost:4000/api`

## Default seeded users

- Admin: `admin@techfy.local` / `Admin123!`
- Support: `support@techfy.local` / `Support123!`

Change them via `backend/.env` (copy from `.env.example`).

## Endpoints overview

- Auth: `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/me`
- Catalog: `GET /api/categories`, `GET /api/products`, `GET /api/products/:id`, `GET /api/countries`
- Orders: `POST /api/orders`, `GET /api/orders/:orderNumber`, `GET /api/me/orders`
- Support (admin/support only):
	- `GET /api/support/orders` (search/filter/pagination)
	- `GET /api/support/orders/lookup?orderNumber=...&email=optional`
	- `PATCH /api/support/orders/:orderNumber/address`
	- `PATCH /api/support/orders/:orderNumber/status`

## Security, rate limiting, and audit

- JWT auth with roles: CUSTOMER, ADMIN, SUPPORT (string role in DB)
- Support endpoints are rate-limited; configure via env:
	- `RATE_LIMIT_SUPPORT_WINDOW_MS` (default 60000)
	- `RATE_LIMIT_SUPPORT_MAX` (default 60)
- All support actions are recorded in `SupportActionLog` for audit.

## Warehouse integration (stub)

- Address changes trigger a simulated label update and return a `labelId`.
- Status changes (e.g., SHIPPED/DELIVERED) push to the stub.
- Replace `src/integrations/warehouse.js` with real WMS calls when ready.
