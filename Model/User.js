import mongoose from "mongoose";
// This schema is for signup user
// const UserSchema = new mongoose.Schema(
//   {
//     userName: {
//       type: String,
//       required: true,
//       trim: true,
//       unique: true,
//     },
//     firstName: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     lastName: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       trim: true,
//       match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
//     },
//     password: {
//       type: String,
//       required: true,
//       minlength: 8,
//     },
//     swapscount: {
//       type: Number,
//       default: 0,
//     },
//     // new fields for email verification and password reset
//     isVerified: {
//       type: Boolean,
//       default: false,
//     },
//     verificationToken: {
//       type: String,
//     },
//     resetPasswordToken: {
//       type: String,
//     },
//     resetPasswordExpires: {
//       type: Date,
//     },
//   },
//   { timestamps: true } //to show user time when it filled the form
// );
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
    isVerified: {
      type: Boolean,
      default: false,
    },
    // ✅ ADD THIS FIELD
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  { timestamps: true }
);

const skillswapuser = mongoose.model("skillswapuser", UserSchema);
export default skillswapuser;
