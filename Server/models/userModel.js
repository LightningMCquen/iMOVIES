const mongoose = require("mongoose");
const { createModel } = require("./dbAdapter");

const userSchema = new mongoose.Schema(
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
      enum: ["user", "admin"],
      default: "user",
    },
    phone: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const MongooseUser = mongoose.models.User || mongoose.model("User", userSchema);
module.exports = createModel("User", MongooseUser);
