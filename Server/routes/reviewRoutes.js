const express = require("express");
const router = express.Router();
const Review = require("../models/reviewModel");
const Movie = require("../models/movieModel");

// Get reviews for a movie
router.get("/:movieId", async (req, res) => {
  try {
    const reviews = await Review.find({ movieId: req.params.movieId }).sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching reviews" });
  }
});

// Add a review
router.post("/", async (req, res) => {
  try {
    const { movieId, movieName, userEmail, userName, rating, comment } = req.body;

    if (!movieId || !userEmail || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Movie ID, userEmail, rating, and comment are required",
      });
    }

    const review = new Review({
      movieId,
      movieName: movieName || "Movie",
      userEmail: userEmail.toLowerCase().trim(),
      userName: userName || userEmail.split("@")[0],
      rating: Number(rating),
      comment: comment.trim(),
    });

    await review.save();

    // Recalculate average rating for movie
    const allReviews = await Review.find({ movieId });
    if (allReviews.length > 0) {
      const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await Movie.findByIdAndUpdate(movieId, { rating: Number(avg.toFixed(1)) });
    }

    res.status(201).json({ success: true, message: "Review posted successfully", review });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error submitting review" });
  }
});

module.exports = router;
