const mongoose = require("mongoose");
const { createModel } = require("./dbAdapter");

const theatreSchema = new mongoose.Schema(
  {
    theatreName: {
      type: String,
      required: true,
      trim: true,
    },
    theatreId: {
      type: String,
      default: () => "TH_" + Date.now().toString(36),
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    balconySeatPrice: {
      type: Number,
      required: true,
      default: 200,
    },
    middleSeatPrice: {
      type: Number,
      required: true,
      default: 130,
    },
    lowerSeatPrice: {
      type: Number,
      required: true,
      default: 100,
    },
    balconySeats: {
      type: Number,
      required: true,
      default: 100,
    },
    middleSeats: {
      type: Number,
      required: true,
      default: 120,
    },
    lowerSeats: {
      type: Number,
      required: true,
      default: 80,
    },
  },
  { timestamps: true }
);

const MongooseTheatre = mongoose.models.Theatre || mongoose.model("Theatre", theatreSchema);
module.exports = createModel("Theatre", MongooseTheatre);
