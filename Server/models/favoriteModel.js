const mongoose = require("mongoose");
const { createModel } = require("./dbAdapter");

const favoriteSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    movieName: {
      type: String,
      required: true,
    },
    posterUrl: {
      type: String,
      default: "",
    },
    releaseDate: {
      type: String,
      default: "",
    },
    genres: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

favoriteSchema.index({ userEmail: 1, movieId: 1 }, { unique: true });

const MongooseFavorite = mongoose.models.Favorite || mongoose.model("Favorite", favoriteSchema);
module.exports = createModel("Favorite", MongooseFavorite);
