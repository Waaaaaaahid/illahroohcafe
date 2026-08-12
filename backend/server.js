// backend/server.js

require("dotenv").config();

const path = require("path");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const menuRoutes = require("./routes/menuRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const cafeRoutes = require("./routes/cafeRoutes");

const {
  notFound,
  errorHandler,
} = require("./middleware/errorMiddleware");

const app = express();

// --------------------------------------------------
// Environment
// --------------------------------------------------

if (!process.env.JWT_SECRET) {
  console.warn(
    "JWT_SECRET is not set. Using development fallback secret."
  );

  process.env.JWT_SECRET = "dev-secret";
}

if (!process.env.CLIENT_URL) {
  process.env.CLIENT_URL = "http://localhost:5173";
}

// --------------------------------------------------
// Security
// --------------------------------------------------

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// --------------------------------------------------
// Logging
// --------------------------------------------------

app.use(
  morgan(
    process.env.NODE_ENV === "production"
      ? "combined"
      : "dev"
  )
);

// --------------------------------------------------
// Rate Limiting
// --------------------------------------------------

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", apiLimiter);

// --------------------------------------------------
// Body Parsers
// --------------------------------------------------

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------------------------------------------
// Mongo Sanitize
// --------------------------------------------------

app.use(mongoSanitize());

// --------------------------------------------------
// Uploaded Files
// --------------------------------------------------

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// --------------------------------------------------
// Health Check
// --------------------------------------------------

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy",
    timestamp: new Date().toISOString(),
  });
});

// --------------------------------------------------
// Routes
// --------------------------------------------------

app.use("/api/auth", authRoutes);

app.use("/api/menu", menuRoutes);

app.use("/api/categories", categoryRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/payment", paymentRoutes);

app.use("/api/users", userRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/cafe", cafeRoutes);

// --------------------------------------------------
// Error Handling
// --------------------------------------------------

app.use(notFound);

app.use(errorHandler);

// --------------------------------------------------
// Local Development Server
// --------------------------------------------------

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(
          `Server running in ${
            process.env.NODE_ENV || "development"
          } mode on port ${PORT}`
        );
      });
    })
    .catch((error) => {
      console.error(
        "Failed to start server:",
        error.message
      );

      process.exit(1);
    });
}

// --------------------------------------------------
// Export for Vercel
// --------------------------------------------------

module.exports = app;