const express = require("express");
const router = express.Router();
const Show = require("../models/showModel");
const Movie = require("../models/movieModel");
const Theatre = require("../models/theatreModel");

// Get all shows (with optional filtering)
router.get("/", async (req, res) => {
  try {
    const { movieName, theatreName, movieId } = req.query;
    let query = {};

    if (movieName) {
      query.movieName = { $regex: new RegExp("^" + movieName + "$", "i") };
    }
    if (movieId) {
      query.movieId = movieId;
    }
    if (theatreName) {
      query.theatreName = { $regex: new RegExp("^" + theatreName + "$", "i") };
    }

    const shows = await Show.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: shows.length, shows });
  } catch (error) {
    console.error("Fetch Shows Error:", error);
    res.status(500).json({ success: false, message: "Server error fetching shows" });
  }
});

// Get single show by ID (populates theatre details & seat prices)
router.get("/:id", async (req, res) => {
  try {
    const show = await Show.findById(req.params.id);
    if (!show) {
      return res.status(404).json({ success: false, message: "Show not found" });
    }

    // Fetch theatre for pricing and capacity
    const theatre = await Theatre.findOne({ theatreName: show.theatreName });

    // Fetch movie for poster and details
    let movie = null;
    if (show.movieId) {
      movie = await Movie.findById(show.movieId);
    }
    if (!movie) {
      movie = await Movie.findOne({ movieName: show.movieName });
    }

    // Filter out expired locks
    const now = new Date();
    const activeLocks = (show.lockedSeats || []).filter((l) => l.expiresAt > now);
    const lockedSeatIds = activeLocks.map((l) => l.seatId);

    res.json({
      success: true,
      show,
      theatre: theatre || {
        theatreName: show.theatreName,
        location: "Main Screen",
        balconySeatPrice: 200,
        middleSeatPrice: 130,
        lowerSeatPrice: 100,
        balconySeats: 100,
        middleSeats: 120,
        lowerSeats: 80,
      },
      movie,
      lockedSeatIds,
    });
  } catch (error) {
    console.error("Show Details Error:", error);
    res.status(500).json({ success: false, message: "Server error fetching show details" });
  }
});

// Add new show
router.post("/", async (req, res) => {
  try {
    const { movieName, movieId, theatreName, showdate, showtime, adminEmail } = req.body;

    if (!movieName || !theatreName || !showdate || !showtime) {
      return res.status(400).json({
        success: false,
        message: "Theatres, Movies, Show Date and Showtime are required",
      });
    }

    // Try finding movieId if not supplied
    let resolvedMovieId = movieId;
    if (!resolvedMovieId) {
      const foundMovie = await Movie.findOne({ movieName: movieName.trim() });
      if (foundMovie) resolvedMovieId = foundMovie._id;
    }

    const show = new Show({
      movieName: movieName.trim(),
      movieId: resolvedMovieId,
      theatreName: theatreName.trim(),
      showdate,
      showtime,
      adminEmail: adminEmail || "admin@imovies.com",
      bookedSeats: [],
      lockedSeats: [],
    });

    await show.save();
    res.status(201).json({ success: true, message: "Show added successfully", show });
  } catch (error) {
    console.error("Add Show Error:", error);
    res.status(500).json({ success: false, message: "Server error adding show" });
  }
});

// Delete show
router.delete("/:id", async (req, res) => {
  try {
    const show = await Show.findByIdAndDelete(req.params.id);
    if (!show) {
      return res.status(404).json({ success: false, message: "Show not found" });
    }
    res.json({ success: true, message: "Show deleted successfully" });
  } catch (error) {
    console.error("Delete Show Error:", error);
    res.status(500).json({ success: false, message: "Server error deleting show" });
  }
});

// Temporary lock seats
router.post("/:id/lock-seats", async (req, res) => {
  try {
    const { seats, userEmail } = req.body;
    const show = await Show.findById(req.params.id);

    if (!show) {
      return res.status(404).json({ success: false, message: "Show not found" });
    }

    const now = new Date();
    // Clear out expired locks
    show.lockedSeats = (show.lockedSeats || []).filter((l) => l.expiresAt > now);

    // Check if any seat is already booked or locked by someone else
    const currentlyLockedSeats = show.lockedSeats
      .filter((l) => l.userEmail !== userEmail)
      .map((l) => l.seatId);

    const alreadyBooked = seats.some((s) => show.bookedSeats.includes(s));
    const alreadyLocked = seats.some((s) => currentlyLockedSeats.includes(s));

    if (alreadyBooked || alreadyLocked) {
      return res.status(400).json({
        success: false,
        message: "One or more selected seats have already been booked or reserved. Please choose different seats.",
      });
    }

    // Set lock for 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    // Remove existing locks by this user on this show
    show.lockedSeats = show.lockedSeats.filter((l) => l.userEmail !== userEmail);
    // Add new locks
    for (const seatId of seats) {
      show.lockedSeats.push({ seatId, userEmail, expiresAt });
    }

    await show.save();
    res.json({ success: true, message: "Seats locked temporarily", expiresAt });
  } catch (error) {
    console.error("Lock Seats Error:", error);
    res.status(500).json({ success: false, message: "Server error locking seats" });
  }
});

// Unlock seats
router.post("/:id/unlock-seats", async (req, res) => {
  try {
    const { seats, userEmail } = req.body;
    const show = await Show.findById(req.params.id);

    if (show) {
      show.lockedSeats = (show.lockedSeats || []).filter(
        (l) => !(l.userEmail === userEmail && (!seats || seats.includes(l.seatId)))
      );
      await show.save();
    }

    res.json({ success: true, message: "Seats unlocked" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error unlocking seats" });
  }
});

module.exports = router;
