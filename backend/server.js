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
const reviewRoutes = require('./routes/reviewRoutes');
const couponRoutes = require('./routes/couponRoutes');

const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && !process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set. Add it to your hosting environment (Vercel) before deploying.');
if (!process.env.JWT_SECRET) { console.warn('JWT_SECRET is not set. Using development fallback secret. Do not use in production.'); process.env.JWT_SECRET = 'dev-secret'; }

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet());

const allowedOrigins = [process.env.CLIENT_URL, process.env.FRONTEND_URL]
  .flatMap((value) => (value ? value.split(',') : []))
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

if (allowedOrigins.length === 0) {
  if (!isProduction) console.warn('CLIENT_URL/FRONTEND_URL are not set. Using local development origins.');
  allowedOrigins.push('http://localhost:5173', 'http://localhost:8080', 'http://127.0.0.1:5173');
}
if (!isProduction) {
  for (const port of ['5173', '8080', '3000', '4173']) for (const host of ['localhost', '127.0.0.1', '[::1]']) allowedOrigins.push(`http://${host}:${port}`);
}

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    if (!isProduction && /^https:\/\/[^/]+-\d+\.app\.github\.dev$/.test(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(morgan(isProduction ? 'combined' : 'dev'));

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false });
app.use('/api', apiLimiter);
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(mongoSanitize());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (_req, res) => res.status(200).json({ success: true, message: 'API is healthy', timestamp: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cafe', cafeRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, '0.0.0.0', () => console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`));
  }).catch((error) => {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  });
}

module.exports = app;
