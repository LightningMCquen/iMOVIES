const express = require("express");
const router = express.Router();
const Movie = require("../models/movieModel");
const Theatre = require("../models/theatreModel");
const Show = require("../models/showModel");
const Booking = require("../models/bookingModel");
const User = require("../models/userModel");

// Admin dashboard summary stats
router.get("/dashboard", async (req, res) => {
  try {
    const totalMovies = await Movie.countDocuments();
    const totalTheatres = await Theatre.countDocuments();
    const totalShows = await Show.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalUsers = await User.countDocuments();

    // Calculate total revenue from non-cancelled bookings
    const revenueAgg = await Booking.aggregate([
      { $match: { paymentStatus: { $ne: "Cancelled" } } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    // Get recent shows and bookings for dashboard display
    const shows = await Show.find().sort({ createdAt: -1 });
    const bookings = await Booking.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      stats: {
        totalMovies,
        totalTheatres,
        totalShows,
        totalBookings,
        totalUsers,
        totalRevenue,
      },
      shows,
      bookings,
    });
  } catch (error) {
    console.error("Admin Dashboard Error:", error);
    res.status(500).json({ success: false, message: "Server error loading dashboard" });
  }
});

module.exports = router;
