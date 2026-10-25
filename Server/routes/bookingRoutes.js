const express = require("express");
const router = express.Router();
const Booking = require("../models/bookingModel");
const Show = require("../models/showModel");
const Movie = require("../models/movieModel");
const { sendBookingConfirmation, sendCancellationNotification } = require("../utils/mailer");

// Create new booking
router.post("/", async (req, res) => {
  try {
    const {
      userEmail,
      userId,
      showId,
      movieName,
      theatreName,
      showdate,
      showtime,
      seats,
      seatCategory,
      totalPrice,
      posterUrl,
      paymentMethod,
    } = req.body;

    if (!userEmail || !showId || !seats || seats.length === 0 || !totalPrice) {
      return res.status(400).json({
        success: false,
        message: "Missing booking details (userEmail, showId, seats, totalPrice are required)",
      });
    }

    const show = await Show.findById(showId);
    if (!show) {
      return res.status(404).json({ success: false, message: "Show not found" });
    }

    // Verify seats are not already booked
    const conflict = seats.some((s) => (show.bookedSeats || []).includes(s));
    if (conflict) {
      return res.status(400).json({
        success: false,
        message: "One or more seats have already been booked by another user.",
      });
    }

    // Attempt to get movie poster if not passed
    let resolvedPoster = posterUrl;
    if (!resolvedPoster) {
      const movie = await Movie.findOne({ movieName: movieName || show.movieName });
      if (movie && movie.posterUrl) {
        resolvedPoster = movie.posterUrl;
      }
    }

    const newBooking = new Booking({
      bookingId: "BK" + Math.floor(100000 + Math.random() * 900000),
      userEmail: userEmail.toLowerCase().trim(),
      userId,
      showId,
      movieName: movieName || show.movieName,
      theatreName: theatreName || show.theatreName,
      showdate: showdate || show.showdate,
      showtime: showtime || show.showtime,
      seats,
      seatCategory: seatCategory || "Middle",
      totalPrice: Number(totalPrice),
      posterUrl: resolvedPoster || "",
      paymentStatus: "Paid",
      paymentMethod: paymentMethod || "Credit/Debit Card",
    });

    await newBooking.save();

    // Add seats to show's bookedSeats and remove from lockedSeats
    show.bookedSeats.push(...seats);
    show.lockedSeats = (show.lockedSeats || []).filter((l) => !seats.includes(l.seatId));
    await show.save();

    // Send confirmation email / notification
    sendBookingConfirmation(newBooking).catch((e) =>
      console.error("Failed to send booking email:", e.message)
    );

    res.status(201).json({
      success: true,
      message: "Ticket booked successfully!",
      booking: newBooking,
    });
  } catch (error) {
    console.error("Booking Creation Error:", error);
    res.status(500).json({ success: false, message: "Server error processing booking" });
  }
});

// Get user bookings
router.get("/user", async (req, res) => {
  try {
    const email = req.query.email || req.header("user-email");
    if (!email) {
      return res.status(400).json({ success: false, message: "User email is required" });
    }

    const bookings = await Booking.find({ userEmail: email.toLowerCase().trim() }).sort({
      createdAt: -1,
    });

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    console.error("Fetch User Bookings Error:", error);
    res.status(500).json({ success: false, message: "Server error fetching user bookings" });
  }
});

// Get all bookings (Admin)
router.get("/all", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    console.error("Fetch All Bookings Error:", error);
    res.status(500).json({ success: false, message: "Server error fetching bookings" });
  }
});

// Get single booking by ID
router.get("/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching booking" });
  }
});

// Cancel booking
router.put("/:id/cancel", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.paymentStatus === "Cancelled") {
      return res.status(400).json({ success: false, message: "Booking is already cancelled" });
    }

    booking.paymentStatus = "Cancelled";
    await booking.save();

    // Release seats on show
    if (booking.showId) {
      const show = await Show.findById(booking.showId);
      if (show) {
        show.bookedSeats = (show.bookedSeats || []).filter((s) => !booking.seats.includes(s));
        await show.save();
      }
    }

    // Send cancellation notice
    sendCancellationNotification(booking).catch(console.error);

    res.json({ success: true, message: "Booking cancelled successfully", booking });
  } catch (error) {
    console.error("Cancel Booking Error:", error);
    res.status(500).json({ success: false, message: "Error cancelling booking" });
  }
});

// Delete booking (Admin)
router.delete("/:id", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Release seats if not already cancelled
    if (booking.showId && booking.paymentStatus !== "Cancelled") {
      const show = await Show.findById(booking.showId);
      if (show) {
        show.bookedSeats = (show.bookedSeats || []).filter((s) => !booking.seats.includes(s));
        await show.save();
      }
    }

    res.json({ success: true, message: "Booking record deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting booking" });
  }
});

module.exports = router;
