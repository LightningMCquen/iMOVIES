const mongoose = require("mongoose");
const { createModel } = require("./dbAdapter");

const showSchema = new mongoose.Schema(
  {
    adminEmail: {
      type: String,
      default: "admin@imovies.com",
    },
    showId: {
      type: String,
      default: () => "SH_" + Math.random().toString(36).substring(2, 9),
    },
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
    },
    movieName: {
      type: String,
      required: true,
      trim: true,
    },
    theatreName: {
      type: String,
      required: true,
      trim: true,
    },
    showdate: {
      type: String,
      required: true,
    },
    showtime: {
      type: String,
      required: true,
    },
    bookedSeats: {
      type: [String],
      default: [],
    },
    lockedSeats: [
      {
        seatId: String,
        userEmail: String,
        expiresAt: Date,
      },
    ],
    tickets: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

const MongooseShow = mongoose.models.Show || mongoose.model("Show", showSchema);
module.exports = createModel("Show", MongooseShow);
