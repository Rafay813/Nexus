// backend/src/index.js
require("dotenv").config();
const express      = require("express");
const cors         = require("cors");
const helmet       = require("helmet");
const cookieParser = require("cookie-parser");
const swaggerUi    = require("swagger-ui-express");
const mongoose     = require("mongoose");
const http         = require("http");
const path         = require("path");

const connectDB            = require("./config/db");
const swaggerSpec          = require("./config/swagger");
const { errorHandler, notFound } = require("./middleware/error.middleware");
const initSignalingServer  = require("./socket/signalingServer");

const rateLimit     = require("express-rate-limit");
const authRoutes     = require("./routes/auth.routes");
const paymentRoutes = require("./routes/paymentRoutes");
const profileRoutes  = require("./routes/profile.routes");
const meetingRoutes  = require("./routes/meetingRoutes");
const documentRoutes = require("./routes/documentRoutes");

// ─── Connect Database ─────────────────────────────────────────────────────────
connectDB();

mongoose.connection.once("open", async () => {
  try {
    await mongoose.connection.collection("users").dropIndex("username_1");
    console.log("✅ Dropped stale username_1 index");
  } catch (e) {
    // safe to ignore
  }
});

// ─── App & HTTP Server ────────────────────────────────────────────────────────
const app    = express();
const server = http.createServer(app);

// ─── Trust Proxy (REQUIRED for Render + rate-limit) ──────────────────────────
app.set("trust proxy", 1);

// ─── Init Socket.IO Signaling ─────────────────────────────────────────────────
initSignalingServer(server);

// ─── Allowed Origins ──────────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://nexus-tau-smoky.vercel.app",
  process.env.CLIENT_URL,
].filter(Boolean);

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      100,
  message:  { success: false, message: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders:   false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      10,
  message:  { success: false, message: "Too many login attempts. Please try again later." },
});

app.use("/api/", limiter);
app.use("/api/auth/login",    authLimiter);
app.use("/api/auth/register", authLimiter);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ─── Serve Uploaded Files Statically ─────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({ success: true, message: "🚀 Nexus API is running", version: "1.0.0", docs: "/api/docs" });
});

app.get("/health", (_req, res) => {
  res.json({ success: true, status: "healthy", timestamp: new Date().toISOString(), uptime: process.uptime() });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/auth",      authRoutes);
app.use("/api/profile",   profileRoutes);
app.use("/api/meetings",  meetingRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/payment",   paymentRoutes);

// ─── Swagger Docs ─────────────────────────────────────────────────────────────
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customSiteTitle: "Nexus API Docs",
}));

// ─── 404 & Error Handler ──────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 Nexus Backend running on port ${PORT}`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api/docs`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}\n`);
});

process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});

module.exports = app;