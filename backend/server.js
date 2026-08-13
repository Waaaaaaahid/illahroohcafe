// backend/server.js
// Express app entrypoint.
require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');

const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const cafeRoutes = require('./routes/cafeRoutes');

const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not set. Add it to your hosting environment (Vercel) before deploying.');
}

if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET is not set. Using development fallback secret. Do not use in production.');
  process.env.JWT_SECRET = 'dev-secret';
}

// ---- Security & core middleware ----
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet());

// ---- CORS ----
// CLIENT_URL (and FRONTEND_URL) may contain multiple origins, comma-separated.
// In production the frontend origin must be set explicitly.
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
]
  .flatMap((value) => (value ? value.split(',') : []))
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

if (allowedOrigins.length === 0) {
  if (!isProduction) {
    console.warn('CLIENT_URL/FRONTEND_URL are not set. Using local development origins.');
  }
  allowedOrigins.push(
    'http://localhost:5173',
    'http://localhost:8080',
    'http://127.0.0.1:5173'
  );
}

// Development: trust the Vite/TanStack dev server on any loopback hostname
// (localhost / 127.0.0.1 / [::1]) and common ports, so the admin UI works no
// matter which address the browser opens. Production remains strict and only
// accepts CLIENT_URL / FRONTEND_URL.
if (!isProduction) {
  for (const port of ['5173', '8080', '3000', '4173']) {
    for (const host of ['localhost', '127.0.0.1', '[::1]']) {
      allowedOrigins.push(`http://${host}:${port}`);
    }
  }
}

app.use(
  cors({
    origin(origin, callback) {
      // Allow same-origin / non-browser requests (curl, server-to-server, health checks).
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Local VS Code + GitHub Codespaces: allow the forwarded *.app.github.dev origins in dev.
      if (!isProduction && /^https:\/\/[^/]+-\d+\.app\.github\.dev$/.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(morgan(isProduction ? 'combined' : 'dev'));

// Rate limiter applied globally to /api routes.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// Razorpay webhook needs the RAW body for HMAC signature verification.
// This MUST run before express.json() consumes the stream.
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(mongoSanitize());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---- Health check ----
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is healthy', timestamp: new Date().toISOString() });
});

// ---- Route mounting ----
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cafe', cafeRoutes);

// ---- Error handling ----
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  connectDB()
    .then(() => {
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error(`Failed to start server: ${error.message}`);
      process.exit(1);
    });
}

module.exports = app;