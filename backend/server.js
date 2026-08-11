// backend/server.js
// Express app entrypoint. This skeleton is NOT connected to a live MongoDB instance.
require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

// const connectDB = require('./config/db'); // TODO: uncomment when ready to connect

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

// ---- Security & core middleware ----
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*', // TODO: restrict to real CLIENT_URL in production
    credentials: true,
  })
);
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Rate limiter applied globally to /api routes.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());

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

// TODO: connectDB()
// Before starting the server for real, uncomment the import above and call:
//   connectDB().then(() => { app.listen(...) });
// This skeleton intentionally starts the HTTP server WITHOUT a database connection.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log('NOTE: MongoDB is NOT connected yet. See config/db.js and the TODO in server.js.');
  });
}

module.exports = app;
