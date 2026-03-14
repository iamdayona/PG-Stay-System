const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

// Rate limiting on auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { message: "Too many attempts. Please try again after 15 minutes." },
});

// Routes
app.use("/api/auth", authLimiter, require("./routes/auth"));
app.use("/api/pgs", require("./routes/pgs"));
app.use("/api/rooms", require("./routes/rooms"));
app.use("/api/applications", require("./routes/applications"));
app.use("/api/feedback", require("./routes/feedback"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/complaints", require("./routes/complaints"));
app.use("/api/admin", require("./routes/admin"));

// Health check
app.get("/", (req, res) => res.json({ message: "PG Stay API is running" }));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
