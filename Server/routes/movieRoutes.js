const express = require("express");
const router = express.Router();
const Movie = require("../models/movieModel");
const Show = require("../models/showModel");
const { fetchUser, verifyAdmin } = require("../middlewares/fetchUser");

// Get all movies (supports query param search and genre)
router.get("/", async (req, res) => {
  try {
    const { search, genre } = req.query;
    let query = {};

    if (search) {
      query.movieName = { $regex: search, $options: "i" };
    }

    if (genre && genre !== "All") {
      query.genres = { $regex: genre, $options: "i" };
    }

    const movies = await Movie.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: movies.length, movies });
  } catch (error) {
    console.error("Fetch Movies Error:", error);
    res.status(500).json({ success: false, message: "Server error fetching movies" });
  }
});

// Get single movie by ID
router.get("/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: "Movie not found" });
    }
    res.json({ success: true, movie });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error fetching movie details" });
  }
});

// Add new movie
router.post("/", async (req, res) => {
  try {
    const {
      movieName,
      description,
      genres,
      releaseDate,
      runtime,
      certification,
      trailerUrl,
      posterUrl,
      cast,
      language,
      rating,
    } = req.body;

    if (!movieName || !description || !genres || !releaseDate) {
      return res.status(400).json({
        success: false,
        message: "Please fill required fields: Movie Name, Description, Genres, and Release Date",
      });
    }

    const movie = new Movie({
      movieName,
      description,
      genres,
      releaseDate,
      runtime: runtime || "150 min",
      certification: certification || "U/A",
      trailerUrl: trailerUrl || "",
      posterUrl: posterUrl || "",
      cast: cast || "",
      language: language || "Telugu, Hindi, English",
      rating: rating ? Number(rating) : 8.5,
    });

    await movie.save();
    res.status(201).json({ success: true, message: "Movie added successfully", movie });
  } catch (error) {
    console.error("Add Movie Error:", error);
    res.status(500).json({ success: false, message: "Server error creating movie" });
  }
});

// Delete movie
router.delete("/:id", async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: "Movie not found" });
    }

    // Also remove any shows associated with this movie
    await Show.deleteMany({
      $or: [{ movieId: req.params.id }, { movieName: movie.movieName }],
    });

    res.json({ success: true, message: "Movie and related shows deleted successfully" });
  } catch (error) {
    console.error("Delete Movie Error:", error);
    res.status(500).json({ success: false, message: "Server error deleting movie" });
  }
});

// Update movie
router.put("/:id", async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!movie) {
      return res.status(404).json({ success: false, message: "Movie not found" });
    }
    res.json({ success: true, message: "Movie updated successfully", movie });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error updating movie" });
  }
});

module.exports = router;
