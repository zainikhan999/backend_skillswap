import mongoose from "mongoose";
// This schema is for signup user
const UserSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    swapscount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true } //to show user time when it filled the form
);

const skillswapuser = mongoose.model("skillswapuser", UserSchema);
export default skillswapuser;
