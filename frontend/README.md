
 task is to 

 Retail & E-Commerce
The Challenge: Margins are thin, and customer patience is non-existent.
Case Study 1: The "Agentic" Support Rep (US Market)
The Problem: A mid-sized fashion retailer was bleeding cash. Their customer support team
was overwhelmed by "Where is my order?" tickets, and their legacy chatbot was useless—it
just deflected people to an FAQ page, causing frustration and lost sales.
The Solution: We didn't build a chatbot; we built an Action Agent. Using a secure
connection to their logistics and order systems, this AI agent doesn't just chat—it acts.
● Scenario: A customer asks, "Can I change my address? I moved."
● Action: The Agent checks if the package has shipped. If not, it updates the shipping
label in the warehouse system instantly and confirms the change to the customer. No
human involvement.
The Result: Support tickets dropped by 70% overnight. The human team now focuses only
on complex VIP issues, while the AI handles the grunt work.ptured the e2e-support journey (checkout → confirmation → admin lookup/address/status patch) in e2e_support.py and documented the manual verification / automation next steps for the agentic workflow.
-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-

Ecom Techfy Demo Project

## Backend Development Plan
- **Goal**: Deliver the persistent order/catalog/support backend that replaces the mock data, powers the storefront flows, and exposes the “Action Agent” support actions described above.
- **Stack**: Node/Express API, Prisma for data modeling, SQLite for local dev with easy swap to Postgres later; JWT auth with role enums (CUSTOMER, ADMIN, SUPPORT).
- **Modeling**: Define Prisma models for Product, User, Order, OrderItem, Address, ShipmentStatus, and SupportActionLog; enforce the rule that shipping address can only change before the ShipmentStatus is SHIPPED.
- **Core APIs**: Implement `/api/products`, `/api/products/:id`, `/api/categories`, `/api/countries`, `/api/auth/signup`, `/api/auth/login`, `/api/me`, `/api/orders`, `/api/orders/:orderNumber`, `/api/me/orders`, `/api/support/orders/lookup`, `/api/support/orders/:orderNumber/address`, `/api/support/orders/:orderNumber/status`, and `/api/support/orders` (with pagination/filtering). Add express-rate-limit + warehouse stub integration in `/backend/src/routes/support.js`.
- **Data/seed scripts**: Provide `npm run backend:migrate` to create the schema and seed data based on existing mockData.js; `npm run backend:dev` should start the API on `http://localhost:4000`with health check at `/health`.
- **Frontend wiring**: Once APIs are stable, swap out mockData imports in Category, Profile, Wishlist, and other pages to consume live endpoints and confirm UI matches real response shapes.
- **Observability**: Capture every install/migrate/dev/manual verification step in the README so the team can retrace the backend’s development history.

## Authentication Notes
- Customers register via the storefront (`/signup`) which now POSTs to `/api/auth/signup`, saves the returned JWT, and keeps the UI on `/profile` in sync with `/api/me`.
- Admin credentials are seeded by `backend/prisma/seed.js` using the `ADMIN_EMAIL`/`ADMIN_PASSWORD` env vars (defaults `admin@techfy.local` / `Admin123!`).
- Admin registration is gated by `ADMIN_REGISTRATION_SECRET` in `backend/.env`; set a value before calling the new `/admin/register` page (and keep the secret private) so the backend will allow creating more users with the `ADMIN` role.

Note: To enable admin self-registration locally you can set a secret in `backend/.env`:

```env
# backend/.env
ADMIN_REGISTRATION_SECRET=your-strong-secret-here
```

Keep this file private and do not commit secrets to source control. If the repo already tracks `backend/.env`, avoid pushing the secret to remote; instead rotate the secret and consider adding `backend/.env` to `.gitignore` and removing it from the index with `git rm --cached backend/.env`.

## Development Plan
- Document current backend/front-end status and next milestones (2026-01-22).
- Verify `npm run backend:dev` + frontend dev server against `http://localhost:4000/api` and capture any UI/UX polish needs.
- Replace the remaining mock data dependencies (Category, Profile, Wishlist, etc.) with live API requests.
- Harden support tooling: confirm rate limiting/auth logs and capture the action-agent workflow in a repeatable script (extend `e2e_support.py` or add CI coverage).

## Update Log
- 2026-01-22: Added this plan to README; will append a new entry here every time a meaningful change is made.
- 2026-01-22: Rewired login to call the backend, persist the access token, and load `/me/orders` so the profile tab now shows real order + address data instead of mocked records.
- 2026-01-22: Added user/admin login CTAs to the home hero and ensured navigation menu buttons use dark text so the links stay visible against the page background.
- 2026-01-22: Hooked the signup and admin login flows to the real API, added an admin registration page that posts `ADMIN_REGISTRATION_SECRET` to `/auth/admin/signup`, and documented the new authentication notes above.
- 2026-01-22: Added admin shipping controls to the order confirmation page so authenticated staff can promote orders through PACKING/SHIPPED/DELIVERED via `/support/orders/:orderNumber/status`.
- 2026-01-22: Enabled customers to confirm delivery from the order confirmation screen once an order reaches SHIPPED so the timeline updates to DELIVERED and the backend records the action.
- 2026-01-22: Upgraded the `ProfilePage` orders list to show an inline status timeline for every order and link directly to the order confirmation screen, so shoppers can follow what’s confirmed/packed/shipped/delivered.

## Development Timeline
- 2026-01-22: Scoped the “Build Backend + Action Agent Support” effort by outlining stack decisions (Node/Express, Prisma/SQLite, JWT roles, API surface) and the Admin UX integration strategy described in plan.readme.md.
- 2026-01-22: Confirmed the backend scaffold is running (Express + Prisma + SQLite dev db) with Catalog/Auth/Orders/Support routes and documented install/migrate/dev commands for team onboarding.
- 2026-01-22: Integrated the “Action Agent” workflow so support/admin users can lookup orders, change addresses (pre-shipping), and advance order status; rate limiting, warehouse stub, and audit logging are in place to harden the flow.
- 2026-01-22: Wired ProductDetail, Checkout, OrderConfirmation, and Admin Orders to the live API endpoints, replacing mockData imports and adding loading/error handling plus pagination/search support.
- 2026-01-22: Fueled Profile’s orders/addresses tabs with `/api/me/orders` data and added frontend auth token persistence so the UI can keep calling the backend without dummy state.



