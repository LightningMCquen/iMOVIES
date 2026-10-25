const express = require("express");
const router = express.Router();
const Favorite = require("../models/favoriteModel");
const Movie = require("../models/movieModel");

// Get favorites for user
router.get("/", async (req, res) => {
  try {
    const email = req.query.email || req.header("user-email");
    if (!email) {
      return res.status(400).json({ success: false, message: "User email required" });
    }

    const favorites = await Favorite.find({ userEmail: email.toLowerCase().trim() }).sort({
      createdAt: -1,
    });
    res.json({ success: true, count: favorites.length, favorites });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching favorites" });
  }
});

// Add favorite
router.post("/", async (req, res) => {
  try {
    const { userEmail, movieId, movieName, posterUrl, releaseDate, genres } = req.body;

    if (!userEmail || !movieId) {
      return res.status(400).json({ success: false, message: "User email and Movie ID required" });
    }

    const normalizedEmail = userEmail.toLowerCase().trim();

    // Check if already favorited
    let favorite = await Favorite.findOne({ userEmail: normalizedEmail, movieId });
    if (favorite) {
      return res.json({ success: true, message: "Movie already in favorites", favorite });
    }

    favorite = new Favorite({
      userEmail: normalizedEmail,
      movieId,
      movieName,
      posterUrl,
      releaseDate,
      genres,
    });

    await favorite.save();
    res.status(201).json({ success: true, message: "Added to favorites", favorite });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error adding favorite" });
  }
});

// Remove favorite
router.delete("/:movieId", async (req, res) => {
  try {
    const email = req.query.email || req.header("user-email");
    if (!email) {
      return res.status(400).json({ success: false, message: "User email required" });
    }

    await Favorite.findOneAndDelete({
      userEmail: email.toLowerCase().trim(),
      movieId: req.params.movieId,
    });

    res.json({ success: true, message: "Removed from favorites" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error removing favorite" });
  }
});

module.exports = router;
