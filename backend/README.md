# Cafe Ordering Platform — Backend (Skeleton)

This is a **complete but intentionally NOT-CONNECTED** Express + Mongoose backend
skeleton for the cafe ordering platform. Routes, models, and middleware are fully
wired together, but every controller handler returns `501 Not Implemented` and
**no database connection is ever established automatically**. This lets you review
the architecture, then fill in real logic and credentials incrementally.

## Status

- ❌ MongoDB: NOT connected (`connectDB()` exists but is never called)
- ❌ JWT auth: structure only, no live user lookups
- ❌ Razorpay: structure only, no live API calls made
- ❌ Cloudinary: structure only, no live uploads
- ❌ Email (SMTP): structure only, no live sending

## Getting started

```bash
cd backend
npm install
cp .env.example .env   # then fill in real values
npm run dev             # nodemon
# or
npm start
```

The server boots and serves `GET /api/health`, but every other route currently
responds with `501 Not Implemented` until you implement the TODOs.

## Environment variables

| Variable | Purpose |
|---|---|
| `PORT` | Port the Express server listens on |
| `NODE_ENV` | `development` / `production` |
| `MONGO_URI` | MongoDB connection string — used in `config/db.js` |
| `JWT_SECRET` | Secret used to sign/verify JWTs — used in `utils/generateToken.js` and `middleware/authMiddleware.js` |
| `JWT_EXPIRES_IN` | JWT expiry, e.g. `30d` |
| `CLIENT_URL` | Frontend origin, used for CORS in `server.js` |
| `RAZORPAY_KEY_ID` | Razorpay public key — `config/razorpay.js` |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key — `config/razorpay.js`, `services/paymentService.js` |
| `RAZORPAY_WEBHOOK_SECRET` | Used to verify webhook signatures — `services/paymentService.js` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account name — `config/cloudinary.js` |
| `CLOUDINARY_API_KEY` | Cloudinary API key — `config/cloudinary.js` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret — `config/cloudinary.js` |
| `SMTP_HOST` | SMTP server host — `services/emailService.js` |
| `SMTP_PORT` | SMTP server port |
| `SMTP_USER` | SMTP auth user |
| `SMTP_PASS` | SMTP auth password |
| `EMAIL_FROM` | "From" address for outgoing emails |

## Where to add real credentials / implementations

| Concern | File(s) |
|---|---|
| MongoDB connection | `backend/config/db.js` (function is ready) — invoke it from `backend/server.js` at the marked `// TODO: connectDB()` block |
| JWT auth | `backend/utils/generateToken.js` (signing), `backend/middleware/authMiddleware.js` (verification + user lookup, currently stubbed with TODOs) |
| Razorpay | `backend/config/razorpay.js` (SDK instance), `backend/services/paymentService.js` (create order / verify signature / verify webhook), `backend/controllers/paymentController.js` (wire the service calls in) |
| Cloudinary uploads | `backend/config/cloudinary.js` (SDK config), `backend/services/uploadService.js` (multer storage), wire into `backend/routes/menuRoutes.js` |
| Email sending | `backend/services/emailService.js`, called from `backend/controllers/authController.js` (password reset) and `backend/controllers/orderController.js` (order confirmations) |
| Mongoose models | `backend/models/*.js` — schemas are fully implemented and ready to use once `connectDB()` is called |

## API endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | User | Get current authenticated user |
| POST | `/api/auth/forgot-password` | Public | Request password reset email |
| POST | `/api/auth/reset-password` | Public | Reset password with token |
| GET | `/api/menu` | Public | List menu items |
| POST | `/api/menu` | Admin | Create menu item |
| GET | `/api/menu/:id` | Public | Get single menu item |
| PUT | `/api/menu/:id` | Admin | Update menu item |
| DELETE | `/api/menu/:id` | Admin | Delete menu item |
| PATCH | `/api/menu/:id/availability` | Admin | Toggle/set item availability |
| GET | `/api/categories` | Public | List categories |
| POST | `/api/categories` | Admin | Create category |
| PUT | `/api/categories/:id` | Admin | Update category |
| DELETE | `/api/categories/:id` | Admin | Delete category |
| POST | `/api/orders` | Public/User | Place an order (guest checkout allowed) |
| GET | `/api/orders` | Admin | List all orders |
| GET | `/api/orders/:id` | User/Admin | Get order details |
| PUT | `/api/orders/:id/status` | Admin | Update order status |
| GET | `/api/orders/my` | User | List current user's orders |
| POST | `/api/payment/create-order` | Public | Create a Razorpay order |
| POST | `/api/payment/verify` | Public | Verify Razorpay payment signature |
| POST | `/api/payment/webhook` | Public (signature-verified) | Razorpay webhook receiver |
| GET | `/api/payment` | Admin | List payments |
| GET | `/api/users/profile` | User | Get own profile |
| PUT | `/api/users/profile` | User | Update own profile |
| GET | `/api/users` | Admin | List all users |
| DELETE | `/api/users/:id` | Admin | Delete a user |
| PUT | `/api/users/:id/role` | Admin | Change a user's role |
| GET | `/api/admin/stats` | Admin | Dashboard stats |
| GET | `/api/cafe/settings` | Public | Get cafe settings |
| PUT | `/api/cafe/settings` | Admin | Update cafe settings |
| GET | `/api/health` | Public | Health check |

## Project structure

```
backend/
  config/        # db, cloudinary, razorpay setup (lazy, no auto-connect)
  models/        # Mongoose schemas (fully implemented)
  controllers/   # Route handlers (501 stubs with detailed TODOs)
  routes/        # Express routers wiring endpoints + middleware
  middleware/    # auth, admin, error handling, validation
  services/      # payment, email, upload, order-total business logic
  utils/         # token, response helpers, async wrapper, constants
  server.js      # App bootstrap (DB connection intentionally not invoked)
  .env.example   # Empty placeholders for all required secrets
```
