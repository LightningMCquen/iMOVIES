const mongoose = require("mongoose");
const { createModel } = require("./dbAdapter");

const movieSchema = new mongoose.Schema(
  {
    movieName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    genres: {
      type: String,
      required: true,
    },
    releaseDate: {
      type: String,
      required: true,
    },
    runtime: {
      type: String,
      default: "150 min",
    },
    certification: {
      type: String,
      default: "U/A",
    },
    trailerUrl: {
      type: String,
      default: "",
    },
    posterUrl: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      default: 8.8,
    },
    language: {
      type: String,
      default: "Telugu, Hindi, English",
    },
    cast: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const MongooseMovie = mongoose.models.Movie || mongoose.model("Movie", movieSchema);
module.exports = createModel("Movie", MongooseMovie);
