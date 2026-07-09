const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const path = require("path");
require("dotenv").config();

const connectMongo = require("./config/mongo");
const { sequelize, syncDB } = require("./config/mysql");
const logger = require("./utils/logger");

// Route imports
const authRoutes = require("./routes/auth");
const jobRoutes = require("./routes/jobs");
const applicationRoutes = require("./routes/applications");
const resumeRoutes = require("./routes/resume");
const analyticsRoutes = require("./routes/analytics");
const recruiterRoutes = require("./routes/recruiter");
const candidateRoutes = require("./routes/candidate");
const notificationRoutes = require("./routes/notifications");
const resumeVersionRoutes = require("./routes/resumeVersions");
const companyRoutes = require("./routes/company");

const app = express();

// Trust proxy fix (for rate limiter)
app.set("trust proxy", 1);

// Connect databases
// connectMongo();

// sequelize
//   .authenticate()
//   .then(() => {
//     logger.info("MySQL connected");
//     return syncDB(); // ← Tables auto-create
//   })
//   .catch((err) => logger.error("MySQL connection error:", err.message));

(async () => {
  try {
    await connectMongo();
    logger.info("MongoDB connected");

    await sequelize.authenticate();
    logger.info("MySQL connected");

    await syncDB();
  } catch (err) {
    logger.error("DB connection failed:", err.message);
  }
})();

// Security & Middleware
app.use(helmet());
app.use(compression());
app.use(
  morgan("combined", { stream: { write: (msg) => logger.info(msg.trim()) } }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests, please try again later." },
  validate: { xForwardedForHeader: false },
});
app.use("/api", limiter);

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/recruiter", recruiterRoutes);
app.use("/api/candidate", candidateRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/resume-versions", resumeVersionRoutes);
app.use("/api/company", companyRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(err.statusCode || 500).json({
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

// Socket.io
const io = require("socket.io")(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  },
});
app.set("io", io);
io.on("connection", (socket) => {
  socket.on("join", (userId) => socket.join(userId));
});

// Graceful shutdown
process.on("SIGTERM", () => server.close(() => process.exit(0)));

module.exports = app;
