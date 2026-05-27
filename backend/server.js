require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const seed = require("./utils/seed");
const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/students");
const attendanceRoutes = require("./routes/attendance");
const { leaveRouter, odRouter } = require("./routes/requests");
const timetableRoutes = require("./routes/timetable");
const dashboardRoutes = require("./routes/dashboard");
const emailRoutes = require("./routes/email");
const achievementRoutes = require("./routes/achievements");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (_req, res) => res.json({ name: "ST Attendance Manager API", ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRouter);
app.use("/api/od", odRouter);
app.use("/api/timetable", timetableRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/achievements", achievementRoutes);

let isConnected = false;
async function connectDb() {
  if (isConnected) return;
  const mongoUri = !process.env.MONGO_URI || process.env.MONGO_URI.includes("<mongodb")
    ? "mongodb://127.0.0.1:27017/st_attendance_manager"
    : process.env.MONGO_URI;
  if (mongoUri.includes("127.0.0.1")) {
    console.warn("Using local MongoDB fallback. Update backend/.env MONGO_URI for Atlas or another database.");
  }
  await mongoose.connect(mongoUri);
  isConnected = true;
  await seed();
}

app.use(async (req, res, next) => {
  if (req.path === "/") return next();
  try {
    await connectDb();
    next();
  } catch (err) {
    console.error("Database connection error:", err);
    res.status(500).json({ error: "Database connection failed", details: err.message });
  }
});

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5002;
  connectDb().then(() => {
    app.listen(PORT, () => console.log(`ST Attendance Manager API running on http://localhost:${PORT}`));
  }).catch((err) => {
    console.error("Failed to start server locally:", err);
    process.exit(1);
  });
}

module.exports = app;
