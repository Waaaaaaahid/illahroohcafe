# Maison Noir — Cafe Ordering Platform

A production-grade cafe ordering website: premium storefront, cart + checkout, order
tracking, authentication UI, and a full admin dashboard — plus a **complete but
intentionally unconnected** Node/Express/MongoDB backend skeleton ready for you to wire
up with your own credentials in GitHub Codespaces.

> **No credentials are committed anywhere.** Every secret is a blank placeholder in
> `.env.example` / `backend/.env.example`.

---

## 1. Architecture

```
/                     frontend (React 19 + Vite + TanStack Start/Router + Tailwind v4)
├── src/
│   ├── assets/            generated imagery
│   ├── components/        Navbar, Footer, Hero, MenuCard, CategoryTabs, CartDrawer,
│   │                      CartItem, Toast, Loading, Modal, ProtectedRoute, admin/, ui/
│   ├── routes/            file-based routes (see below)
│   ├── context/           AuthContext, CartContext, CafeContext, ToastContext
│   ├── services/          api.ts, authService, menuService, orderService,
│   │                      paymentService, adminService  ← the only place URLs live
│   ├── lib/               types.ts (mirrors the Mongoose models), mock/ (preview data)
│   ├── utils/             format.ts, validators.ts
│   └── constants/         nav links, sort options, order status flow, storage keys
└── backend/           Express + Mongoose skeleton (config, models, controllers,
                       routes, middleware, services, utils, server.js)
```

Routing note: this frontend uses **TanStack Router file-based routing** (`src/routes/*.tsx`),
which replaces a `src/pages` folder. Each file maps to a URL:
`/`, `/menu`, `/about`, `/contact`, `/login`, `/register`, `/forgot-password`,
`/reset-password`, `/cart`, `/checkout`, `/order-success`, `/order-tracking`,
`/profile`, and `/admin`, `/admin/menu`, `/admin/menu/new`, `/admin/menu/:id`,
`/admin/categories`, `/admin/orders`, `/admin/users`, `/admin/payments`,
`/admin/settings`.

---

## 2. Run the frontend

```bash
bun install     # or npm install
cp .env.example .env.local
bun run dev     # http://localhost:8080
```

Demo auth (mock mode): any password works. Sign in with an email starting with
`admin` (e.g. `admin@cafe.dev`) to unlock the admin dashboard.

## 3. Run the backend

```bash
cd backend
npm install
cp .env.example .env      # fill in YOUR values
npm run dev               # http://localhost:5000
```

The server boots without a database on purpose. Enable Mongo by uncommenting the
marked `connectDB()` call in `backend/server.js`.

---

## 4. Environment variables

**Frontend — `.env.example`**

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Express base URL, e.g. `http://localhost:5000/api` |
| `VITE_USE_MOCK_API` | `false` = use the real API; anything else = mock data |
| `VITE_RAZORPAY_KEY_ID` | Razorpay **publishable** key id only |

**Backend — `backend/.env.example`**

`PORT`, `NODE_ENV`, `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL`,
`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`,
`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`,
`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` — all blank.

`RAZORPAY_KEY_SECRET` must **never** appear in frontend code or a `VITE_` variable.

---

## 5. API endpoints

| Method | Endpoint | Access |
| --- | --- | --- |
| POST | `/api/auth/register` · `/login` · `/forgot-password` · `/reset-password` | public |
| GET | `/api/auth/me` | auth |
| GET | `/api/menu` · `/api/menu/:id` | public |
| POST/PUT/DELETE | `/api/menu` · `/api/menu/:id` · `PATCH /api/menu/:id/availability` | admin |
| GET | `/api/categories` | public |
| POST/PUT/DELETE | `/api/categories` · `/api/categories/:id` | admin |
| POST/GET | `/api/orders` · `GET /api/orders/my` · `GET /api/orders/:id` | auth |
| PUT | `/api/orders/:id/status` | admin |
| POST | `/api/payment/create-order` · `/verify` | auth |
| POST | `/api/payment/webhook` | public (signature-verified) |
| GET | `/api/payment` | admin |
| GET/PUT | `/api/users/profile` | auth |
| GET/DELETE/PUT | `/api/users` · `/api/users/:id` · `/api/users/:id/role` | admin |
| GET | `/api/admin/stats` | admin |
| GET/PUT | `/api/cafe/settings` | public read / admin write |

---

## 6. Where to add YOUR credentials & implementation

| Concern | File | What to do |
| --- | --- | --- |
| MongoDB connection | `backend/config/db.js` + `backend/server.js` | set `MONGO_URI`, uncomment `connectDB()` |
| JWT | `backend/utils/generateToken.js`, `backend/middleware/authMiddleware.js` | set `JWT_SECRET`, finish verify logic |
| Password hashing | `backend/models/User.js` | bcrypt pre-save hook is implemented |
| Razorpay | `backend/config/razorpay.js`, `backend/services/paymentService.js`, `backend/controllers/paymentController.js` | add keys, finish create/verify/webhook |
| Cloudinary | `backend/config/cloudinary.js`, `backend/services/uploadService.js` | add cloud name/key/secret |
| Email | `backend/services/emailService.js` | add SMTP credentials |

Every controller ships as a stub returning `501 Not Implemented` with a `// TODO:`
describing exactly what to build — ideal for an AI assistant in Codespaces.

---

## 7. Connecting the frontend to the backend

1. Start the Express server.
2. In `.env.local`, set `VITE_API_URL=http://localhost:5000/api` and
   `VITE_USE_MOCK_API=false`.
3. That's it. Every service in `src/services/*` already branches on that flag, so no
   component changes are required. The mock layer (`src/lib/mock/`) stays available for
   design work.

## 8. Deploying

- **Frontend:** any static/edge host that runs the Vite build (`bun run build`).
  Set the `VITE_*` variables in the host's dashboard.
- **Backend:** Render, Railway, Fly.io or a VPS. Set every backend env var as a secret,
  point `CLIENT_URL` at the deployed frontend for CORS, and use MongoDB Atlas for
  `MONGO_URI`.
- Configure the Razorpay webhook to `POST https://<api-host>/api/payment/webhook`.

---

## 9. Security posture

JWT auth, bcrypt hashing, role-based authorization (`authMiddleware` + `adminMiddleware`),
express-validator request validation, centralized error handling, helmet, CORS allow-list,
rate limiting and mongo-sanitize are all structured in `backend/`. Client-side
`ProtectedRoute` is UX only — the server is the authority.
