const mongoose = require("mongoose");
const { createModel } = require("./dbAdapter");

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "admin",
    },
  },
  { timestamps: true }
);

const MongooseAdmin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);
module.exports = createModel("Admin", MongooseAdmin);
