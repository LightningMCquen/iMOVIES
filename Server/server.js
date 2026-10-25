require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const movieRoutes = require("./routes/movieRoutes");
const theatreRoutes = require("./routes/theatreRoutes");
const showRoutes = require("./routes/showRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const adminRoutes = require("./routes/adminRoutes");

const { seedDatabase } = require("./utils/seedData");
const { startCleanupService } = require("./utils/cleanupService");
const { startReminderService } = require("./utils/reminderService");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/theatres", theatreRoutes);
app.use("/api/shows", showRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "iMovies Backend API",
    dbEngine: mongoose.connection?.readyState === 1 ? "MongoDB" : "Embedded Persistent Storage",
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 8000;
const mongoUri =
  process.env.MONGODB_CONNECTION_LINK ||
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/Imovies";

async function startServer() {
  // 1. Try connecting to external MongoDB
  try {
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    console.log("Connected to MongoDB successfully!");
  } catch (err) {
    console.warn(`[DB Notice] External MongoDB not active (${err.message}).`);
    console.log("[DB Notice] Operating with embedded persistent database engine (Server/data/).");
  }

  // 2. Seed initial data (movies, theatres, shows, admin, demo bookings)
  await seedDatabase();

  // 3. Start background utility tasks
  startCleanupService();
  startReminderService();

  // 4. Start HTTP server
  app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 iMovies Server is running on http://localhost:${PORT}`);
    console.log(`👉 API Base: http://localhost:${PORT}/api`);
    console.log(`=================================================`);
  });
}

startServer().catch((err) => {
  console.error("Server startup failed:", err);
});
