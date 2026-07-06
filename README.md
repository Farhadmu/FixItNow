# FixItNow 🔧 — Home Service Marketplace Backend

Assignment 4 (Programming Hero) — Backend-only REST API built with **Node.js, Express, TypeScript, PostgreSQL, Prisma, JWT and Stripe**.

---

## 1. Tech Stack

- Node.js + Express + TypeScript
- PostgreSQL + Prisma ORM
- JWT authentication (role-based: CUSTOMER / TECHNICIAN / ADMIN)
- Zod for request validation
- Stripe for payment integration
- bcryptjs for password hashing

---

## 2. Project Structure

```
fixitnow-backend/
├── prisma/
│   ├── schema.prisma        # DB schema (Users, Services, Bookings, Payments, Reviews...)
│   └── seed.ts               # Creates Admin user + default categories
├── postman/
│   └── FixItNow.postman_collection.json
├── src/
│   ├── config/env.ts
│   ├── lib/                  # prisma client, jwt helpers, stripe client
│   ├── middlewares/           # auth, role, validation, error handling (404 & global)
│   ├── modules/
│   │   ├── auth/
│   │   ├── category/
│   │   ├── service/
│   │   ├── technician/
│   │   ├── booking/
│   │   ├── payment/
│   │   ├── review/
│   │   └── user/ (admin)
│   ├── routes/index.ts
│   ├── app.ts
│   └── server.ts
├── .env.example
├── package.json
└── tsconfig.json
```

Every error response across the whole API has the same shape (mandatory requirement #2):
```json
{ "success": false, "message": "...", "errorDetails": "..." }
```
Every success response has the same shape too:
```json
{ "success": true, "message": "...", "meta": { "page": 1, "limit": 10, "total": 42 }, "data": {} }
```

---

## 3. 🖥️ Run Locally in VS Code (step by step)

### Step 1 — Prerequisites
Install these first:
- **Node.js** (v18 or v20 LTS) → https://nodejs.org
- **VS Code** → https://code.visualstudio.com
- A **PostgreSQL database**. Easiest free options (no local Postgres install needed):
  - [Neon.tech](https://neon.tech) (recommended, free tier)
  - [Supabase](https://supabase.com)
  - [Railway](https://railway.app)
  - Or install Postgres locally if you prefer.

### Step 2 — Open the project
1. Unzip the project folder you received.
2. Open **VS Code** → `File > Open Folder` → select `fixitnow-backend`.
3. Open a terminal inside VS Code: `Terminal > New Terminal`.

### Step 3 — Install dependencies
```bash
npm install
```

### Step 4 — Configure environment variables
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   (On Windows, just duplicate the file manually and rename it to `.env`.)
2. Open `.env` and fill in:
   - `DATABASE_URL` → paste the connection string from Neon/Supabase/Railway (or your local Postgres).
   - `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` → any long random string.
   - `STRIPE_SECRET_KEY` → get a free **test** key from https://dashboard.stripe.com/test/apikeys (starts with `sk_test_...`).
   - `STRIPE_WEBHOOK_SECRET` → optional for local testing (only needed if you use the `/api/payments/webhook` route with the Stripe CLI).
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` → the admin login you will submit.

### Step 5 — Create the database tables
```bash
npx prisma migrate dev --name init
```
This reads `prisma/schema.prisma` and creates all tables in your Postgres database.

### Step 6 — Seed the Admin user + categories (mandatory requirement)
```bash
npm run seed
```
This creates the Admin account using the `ADMIN_EMAIL` / `ADMIN_PASSWORD` from your `.env`, plus 6 default service categories.

### Step 7 — Run the server
```bash
npm run dev
```
You should see:
```
✅ Database connected successfully
🚀 FixItNow API is running on http://localhost:5000
```

### Step 8 — Test with Postman
1. Open Postman → `Import` → select `postman/FixItNow.postman_collection.json`.
2. Set the collection variable `baseUrl` to `http://localhost:5000/api`.
3. Run **Auth → Register Customer**, **Register Technician**, then **Login** for each role and copy the `accessToken` from the response into the `customerToken` / `technicianToken` / `adminToken` collection variables.
4. Test the rest of the endpoints (Categories → Services → Bookings → Payments → Reviews → Admin) in that order, since later steps depend on IDs created earlier (categoryId, serviceId, bookingId).

> 💡 To fully test the payment flow: create a booking → have the technician `Accept` it → call `Payments/Create Payment Session` → open the returned `checkoutUrl` in a browser → pay with Stripe's test card `4242 4242 4242 4242`, any future expiry, any CVC → then call `Payments/Confirm Payment` with the `sessionId` to mark it COMPLETED.

---

## 4. 🚀 Deploying (for submission)

### Database (if you haven't already)
Use a hosted Postgres (Neon / Supabase / Railway) — free tier is enough. Copy its connection string into `DATABASE_URL`.

### Option A — Deploy to Render (recommended, simplest for Express + Postgres)
1. Push your project to a GitHub repository.
2. Go to https://render.com → New → Web Service → connect your GitHub repo.
3. Settings:
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npx prisma migrate deploy && npm start`
   - Add all variables from your `.env` under **Environment**.
4. Deploy. Render gives you a live URL like `https://fixitnow-backend.onrender.com`.
5. Run the seed once (Render Shell tab or a one-off job): `npm run seed`.

### Option B — Deploy to Vercel
1. Push to GitHub.
2. Import the repo in https://vercel.com/new.
3. Add a `vercel.json` (optional) or use Vercel's Node preset; set the same environment variables.
4. Vercel serverless functions work best with `npx prisma generate` in the build step (already wired via `postinstall`).
5. Because serverless functions are stateless, run migrations from your local machine against the production `DATABASE_URL` before/while deploying:
   ```bash
   npx prisma migrate deploy
   npm run seed
   ```

### Stripe Webhook (only if you want live webhook confirmation instead of manual `/confirm`)
In the Stripe Dashboard → Developers → Webhooks → Add endpoint:
`https://<your-live-url>/api/payments/webhook`, event: `checkout.session.completed`. Copy the signing secret into `STRIPE_WEBHOOK_SECRET` on your host.

---

## 5. 🎥 Recording the demo video
Cover, in 3–5 minutes:
1. Quick project/API architecture overview.
2. Register + login as Customer, Technician, and Admin in Postman.
3. Customer creates a booking → Technician accepts it → Customer pays via Stripe test card → Technician marks IN_PROGRESS → COMPLETED → Customer leaves a review.
4. Show a validation error and a 404 error to demonstrate the structured error format.
5. Briefly mention one challenge you solved (e.g. Stripe checkout session + webhook confirmation, or booking status state machine).

---

## 6. 📦 What to submit
Fill this out and submit as instructed by `README.md` (assignment root):
```
Backend Repo     : https://github.com/<your-username>/fixitnow-backend
Live API         : https://<your-deployed-url>/api
API Docs         : postman/FixItNow.postman_collection.json (import into Postman) 
                    or publish via "Export" > "Publish Docs" on Postman for a shareable link
Demo Video       : <your Loom/Drive link>
Admin Email      : <the ADMIN_EMAIL you set in .env>
Admin Password   : <the ADMIN_PASSWORD you set in .env>
```

### Before pushing to GitHub
- Make sure `.env` is **not** committed (already in `.gitignore`).
- Commit in small, meaningful steps (aim for 20+ commits) — e.g. "feat: auth module", "feat: booking status state machine", "feat: stripe payment integration", "fix: validation error format", etc., instead of one giant commit.

---

## 7. API Endpoint Summary

| Module | Endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Categories | `GET /api/categories`, `POST /api/categories` (admin), `PATCH /api/categories/:id` (admin), `DELETE /api/categories/:id` (admin) |
| Services | `GET /api/services`, `GET /api/services/:id`, `POST /api/services` (technician), `PATCH /api/services/:id` (technician), `DELETE /api/services/:id` (technician) |
| Technicians | `GET /api/technicians`, `GET /api/technicians/:id`, `PUT /api/technician/profile/me`, `PUT /api/technician/availability/me`, `GET /api/technician/bookings/me`, `PATCH /api/technician/bookings/:id` |
| Bookings | `POST /api/bookings` (customer), `GET /api/bookings` (customer), `GET /api/bookings/:id`, `PATCH /api/bookings/:id/cancel` (customer) |
| Payments | `POST /api/payments/create`, `POST /api/payments/confirm`, `GET /api/payments`, `GET /api/payments/:id`, `POST /api/payments/webhook` (Stripe only) |
| Reviews | `POST /api/reviews` (customer) |
| Admin | `GET /api/admin/users`, `PATCH /api/admin/users/:id`, `GET /api/admin/bookings`, `GET /api/admin/categories`, `POST /api/admin/categories` |

Booking status flow: `REQUESTED → ACCEPTED/DECLINED → PAID → IN_PROGRESS → COMPLETED` (customer can `CANCEL` any time before `IN_PROGRESS`).
