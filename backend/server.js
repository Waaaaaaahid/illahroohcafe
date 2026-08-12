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
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();
const isProduction = process.env.NODE_ENV === "production";

if (!process.env.JWT_SECRET) {
  if (isProduction) {
    throw new Error("JWT_SECRET is required in production");
  }
  console.warn("JWT_SECRET is not set; using a development-only fallback.");
  process.env.JWT_SECRET = "dev-only-change-me";
}

const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
]
  .flatMap((value) => (value ? value.split(",") : []))
  .map((value) => value.trim())
  .filter(Boolean);

if (!allowedOrigins.length) {
  if (isProduction) {
    throw new Error("CLIENT_URL or FRONTEND_URL is required in production");
  }
  allowedOrigins.push("http://localhost:5173");
}

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS origin not allowed"));
    },
    credentials: true,
  })
);

app.use(morgan(isProduction ? "combined" : "dev"));

app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Razorpay webhooks require the exact raw request body for signature verification.
app.use("/api/payment/webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(mongoSanitize());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/cafe", cafeRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(
          `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`
        );
      });
    })
    .catch((error) => {
      console.error("Failed to start server:", error.message);
      process.exit(1);
    });
}

module.exports = app;
