const mongoose = require("mongoose");
const { createModel } = require("./dbAdapter");

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      default: () => "BK" + Math.floor(100000 + Math.random() * 900000),
    },
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    showId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Show",
    },
    movieName: {
      type: String,
      required: true,
    },
    theatreName: {
      type: String,
      required: true,
    },
    showdate: {
      type: String,
      required: true,
    },
    showtime: {
      type: String,
      required: true,
    },
    seatCategory: {
      type: String,
      default: "Middle",
    },
    seats: {
      type: [String],
      required: true,
    },
    ticketsData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Pending", "Failed", "Cancelled"],
      default: "Paid",
    },
    paymentMethod: {
      type: String,
      default: "Card",
    },
    posterUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const MongooseBooking = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
module.exports = createModel("Booking", MongooseBooking);
