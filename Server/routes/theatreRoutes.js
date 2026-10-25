const express = require("express");
const router = express.Router();
const Theatre = require("../models/theatreModel");
const Show = require("../models/showModel");

// Get all theatres
router.get("/", async (req, res) => {
  try {
    const theatres = await Theatre.find().sort({ createdAt: -1 });
    res.json({ success: true, count: theatres.length, theatres });
  } catch (error) {
    console.error("Fetch Theatres Error:", error);
    res.status(500).json({ success: false, message: "Server error fetching theatres" });
  }
});

// Get single theatre
router.get("/:id", async (req, res) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    if (!theatre) {
      return res.status(404).json({ success: false, message: "Theatre not found" });
    }
    res.json({ success: true, theatre });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error fetching theatre" });
  }
});

// Add new theatre
router.post("/", async (req, res) => {
  try {
    const {
      theatreName,
      location,
      balconySeatPrice,
      balconySeatCount,
      balconySeats,
      middleSeatPrice,
      middleSeatCount,
      middleSeats,
      lowerSeatPrice,
      lowerSeatCount,
      lowerSeats,
    } = req.body;

    if (!theatreName || !location) {
      return res.status(400).json({
        success: false,
        message: "Theatre Name and Theatre Location are required",
      });
    }

    const theatre = new Theatre({
      theatreName: theatreName.trim(),
      location: location.trim(),
      balconySeatPrice: Number(balconySeatPrice) || 200,
      middleSeatPrice: Number(middleSeatPrice) || 130,
      lowerSeatPrice: Number(lowerSeatPrice) || 100,
      balconySeats: Number(balconySeatCount || balconySeats) || 100,
      middleSeats: Number(middleSeatCount || middleSeats) || 120,
      lowerSeats: Number(lowerSeatCount || lowerSeats) || 80,
    });

    await theatre.save();
    res.status(201).json({ success: true, message: "Theatre added successfully", theatre });
  } catch (error) {
    console.error("Add Theatre Error:", error);
    res.status(500).json({ success: false, message: "Server error adding theatre" });
  }
});

// Delete theatre
router.delete("/:id", async (req, res) => {
  try {
    const theatre = await Theatre.findByIdAndDelete(req.params.id);
    if (!theatre) {
      return res.status(404).json({ success: false, message: "Theatre not found" });
    }

    // Delete associated shows
    await Show.deleteMany({ theatreName: theatre.theatreName });

    res.json({ success: true, message: "Theatre deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error deleting theatre" });
  }
});

module.exports = router;
