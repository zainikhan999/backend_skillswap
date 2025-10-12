// import bcrypt from "bcrypt";
// import skillswapuser from "../Model/User.js";
// import Otp from "../Model/Otp.js";
// import { TryCatch } from "../middleware/error.js";
// import jwt from "jsonwebtoken";
// import { setTokenCookie } from "../utils/cookieUtils.js";
// import {
//   generateOTP,
//   sendVerificationEmail,
//   sendPasswordResetEmail,
// } from "../utils/emailService.js";

// // Updated Signup - Send OTP instead of immediate registration
// export const signup = TryCatch(async (req, res, next) => {
//   const { userName, firstName, lastName, email, password } = req.body;

//   if (!userName || !firstName || !lastName || !email || !password) {
//     return res.status(400).json({ message: "All fields are required" });
//   }

//   const lowerCaseUserName = userName.toLowerCase();
//   const lowerCaseEmail = email.toLowerCase();

//   // Check if user already exists
//   const existingUser = await skillswapuser.findOne({
//     $or: [{ userName: lowerCaseUserName }, { email: lowerCaseEmail }],
//   });

//   if (existingUser) {
//     const conflictField =
//       existingUser.userName === lowerCaseUserName ? "Username" : "Email";
//     return res.status(400).json({ message: `${conflictField} already exists` });
//   }

//   // Generate OTP
//   const otp = generateOTP();

//   // Save OTP to database
//   await Otp.create({
//     email: lowerCaseEmail,
//     otp,
//     type: "verification",
//   });

//   // Send verification email
//   await sendVerificationEmail(lowerCaseEmail, otp);

//   // Store user data temporarily in session/cache (or send it back to frontend)
//   return res.status(200).json({
//     message: "Verification email sent! Please check your inbox.",
//     email: lowerCaseEmail,
//     tempData: { userName, firstName, lastName, email, password },
//   });
// });

// // Verify Email OTP
// export const verifyEmail = TryCatch(async (req, res, next) => {
//   const { email, otp, userData } = req.body;

//   const lowerCaseEmail = email.toLowerCase();

//   // Find OTP
//   const otpRecord = await Otp.findOne({
//     email: lowerCaseEmail,
//     otp,
//     type: "verification",
//   });

//   if (!otpRecord) {
//     return res.status(400).json({ message: "Invalid or expired OTP" });
//   }

//   // Hash password
//   const hashedPassword = await bcrypt.hash(userData.password, 10);

//   // Create user
//   const newUser = new skillswapuser({
//     userName: userData.userName.toLowerCase(),
//     firstName: userData.firstName,
//     lastName: userData.lastName,
//     email: lowerCaseEmail,
//     password: hashedPassword,
//     isVerified: true,
//   });

//   const result = await newUser.save();

//   // Delete OTP after successful verification
//   await Otp.deleteOne({ _id: otpRecord._id });

//   // Generate token
//   const token = jwt.sign({ id: result._id }, process.env.JWT_SECRET, {
//     expiresIn: "7d",
//   });

//   setTokenCookie(res, token);

//   return res.status(201).json({
//     message: "Email verified! Account created successfully.",
//     userType: "user",
//     _id: result._id,
//     userName: result.userName,
//     firstName: result.firstName,
//     lastName: result.lastName,
//   });
// });

// // Request Password Reset
// export const forgotPassword = TryCatch(async (req, res, next) => {
//   const { email } = req.body;

//   if (!email) {
//     return res.status(400).json({ message: "Email is required" });
//   }

//   const lowerCaseEmail = email.toLowerCase();

//   // Find user
//   const user = await skillswapuser.findOne({ email: lowerCaseEmail });

//   if (!user) {
//     // Don't reveal if user exists or not (security practice)
//     return res.status(200).json({
//       message: "If an account exists, a reset email has been sent.",
//     });
//   }

//   // Generate OTP
//   const otp = generateOTP();

//   // Save OTP
//   await Otp.create({
//     email: lowerCaseEmail,
//     otp,
//     type: "password-reset",
//   });

//   // Send reset email
//   await sendPasswordResetEmail(lowerCaseEmail, otp);

//   return res.status(200).json({
//     message: "Password reset OTP sent to your email.",
//     email: lowerCaseEmail,
//   });
// });

// // Verify Reset OTP
// export const verifyResetOTP = TryCatch(async (req, res, next) => {
//   const { email, otp } = req.body;

//   const lowerCaseEmail = email.toLowerCase();

//   const otpRecord = await Otp.findOne({
//     email: lowerCaseEmail,
//     otp,
//     type: "password-reset",
//   });

//   if (!otpRecord) {
//     return res.status(400).json({ message: "Invalid or expired OTP" });
//   }

//   return res.status(200).json({
//     message: "OTP verified! You can now reset your password.",
//     email: lowerCaseEmail,
//   });
// });

// // Reset Password
// export const resetPassword = TryCatch(async (req, res, next) => {
//   const { email, otp, newPassword } = req.body;

//   if (!email || !otp || !newPassword) {
//     return res.status(400).json({ message: "All fields are required" });
//   }

//   const lowerCaseEmail = email.toLowerCase();

//   // Verify OTP again
//   const otpRecord = await Otp.findOne({
//     email: lowerCaseEmail,
//     otp,
//     type: "password-reset",
//   });

//   if (!otpRecord) {
//     return res.status(400).json({ message: "Invalid or expired OTP" });
//   }

//   // Find user
//   const user = await skillswapuser.findOne({ email: lowerCaseEmail });

//   if (!user) {
//     return res.status(404).json({ message: "User not found" });
//   }

//   // Hash new password
//   const hashedPassword = await bcrypt.hash(newPassword, 10);

//   // Update password
//   user.password = hashedPassword;
//   await user.save();

//   // Delete OTP
//   await Otp.deleteOne({ _id: otpRecord._id });

//   return res.status(200).json({
//     message: "Password reset successfully! You can now login.",
//   });
// });

// // Resend OTP
// export const resendOTP = TryCatch(async (req, res, next) => {
//   const { email, type } = req.body; // type: 'verification' or 'password-reset'

//   const lowerCaseEmail = email.toLowerCase();

//   // Delete old OTPs
//   await Otp.deleteMany({ email: lowerCaseEmail, type });

//   // Generate new OTP
//   const otp = generateOTP();

//   // Save new OTP
//   await Otp.create({
//     email: lowerCaseEmail,
//     otp,
//     type,
//   });

//   // Send email based on type
//   if (type === "verification") {
//     await sendVerificationEmail(lowerCaseEmail, otp);
//   } else {
//     await sendPasswordResetEmail(lowerCaseEmail, otp);
//   }

//   return res.status(200).json({
//     message: "New OTP sent successfully!",
//   });
// });

// export const login = TryCatch(async (req, res, next) => {
//   const { userName, password } = req.body;

//   console.log(`Login attempt for username: ${userName}`);

//   try {
//     const user = await skillswapuser.findOne({
//       userName: userName.toLowerCase(),
//     });

//     if (user) {
//       console.log("User found:", user);

//       // Compare the entered password with the stored hashed password
//       const passwordMatch = await bcrypt.compare(password, user.password);
//       console.log("Password match:", passwordMatch);

//       if (passwordMatch) {
//         console.log("User login successful");
//         // ✅ Generate token
//         const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//           expiresIn: "7d",
//         });

//         // ✅ Set cookie
//         setTokenCookie(res, token);
//         return res.status(200).json({
//           message: "User login successful",
//           userType: "user",
//           _id: user._id,
//           userName: user.userName,
//           firstName: user.firstName,
//           lastName: user.lastName,
//         });
//         // return res
//         //   .status(200)
//         //   .json({ message: "User login successful", userType: "user" });
//       } else {
//         console.log("Invalid password");
//         return res
//           .status(401)
//           .json({ message: "Invalid username or password" });
//       }
//     }

//     // If the user is not found
//     console.log("User not found");
//     return res.status(401).json({ message: "Invalid username or password" });
//   } catch (error) {
//     console.error("Error during login:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// });

// export const logout = (req, res) => {
//   res.clearCookie("token", {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "DEPLOYMENT", // true for HTTPS
//     sameSite: "strict",
//   });
//   return res.status(200).json({ message: "Logged out successfully" });
// };
import bcrypt from "bcrypt";
import skillswapuser from "../Model/User.js";
import Otp from "../Model/Otp.js";
import { TryCatch } from "../middleware/error.js";
import jwt from "jsonwebtoken";
import { setTokenCookie } from "../utils/cookieUtils.js";
import {
  generateOTP,
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../utils/emailService.js";

// Updated Signup - Send OTP instead of immediate registration
export const signup = TryCatch(async (req, res, next) => {
  const { userName, firstName, lastName, email, password } = req.body;

  if (!userName || !firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const lowerCaseUserName = userName.toLowerCase();
  const lowerCaseEmail = email.toLowerCase();

  // Check if user already exists
  const existingUser = await skillswapuser.findOne({
    $or: [{ userName: lowerCaseUserName }, { email: lowerCaseEmail }],
  });

  if (existingUser) {
    const conflictField =
      existingUser.userName === lowerCaseUserName ? "Username" : "Email";
    return res.status(400).json({ message: `${conflictField} already exists` });
  }

  // Generate OTP
  const otp = generateOTP();

  // Save OTP to database
  await Otp.create({
    email: lowerCaseEmail,
    otp,
    type: "verification",
  });

  // Send verification email
  await sendVerificationEmail(lowerCaseEmail, otp);

  // Store user data temporarily in session/cache (or send it back to frontend)
  return res.status(200).json({
    message: "Verification email sent! Please check your inbox.",
    email: lowerCaseEmail,
    tempData: { userName, firstName, lastName, email, password },
  });
});

// Verify Email OTP
export const verifyEmail = TryCatch(async (req, res, next) => {
  const { email, otp, userData } = req.body;

  const lowerCaseEmail = email.toLowerCase();

  // Find OTP
  const otpRecord = await Otp.findOne({
    email: lowerCaseEmail,
    otp,
    type: "verification",
  });

  if (!otpRecord) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  // Create user
  const newUser = new skillswapuser({
    userName: userData.userName.toLowerCase(),
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: lowerCaseEmail,
    password: hashedPassword,
    isVerified: true,
  });

  const result = await newUser.save();

  // Delete OTP after successful verification
  await Otp.deleteOne({ _id: otpRecord._id });

  // Generate token
  const token = jwt.sign({ id: result._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  setTokenCookie(res, token);

  // ✅ FIXED: Include emailVerified and profileCompleted
  return res.status(201).json({
    message: "Email verified! Account created successfully.",
    userType: "user",
    _id: result._id,
    userName: result.userName,
    firstName: result.firstName,
    lastName: result.lastName,
    emailVerified: true,
    profileCompleted: false, // Will be updated when user completes profile
  });
});

// Request Password Reset
export const forgotPassword = TryCatch(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const lowerCaseEmail = email.toLowerCase();

  // Find user
  const user = await skillswapuser.findOne({ email: lowerCaseEmail });

  if (!user) {
    // Don't reveal if user exists or not (security practice)
    return res.status(200).json({
      message: "If an account exists, a reset email has been sent.",
    });
  }

  // Generate OTP
  const otp = generateOTP();

  // Save OTP
  await Otp.create({
    email: lowerCaseEmail,
    otp,
    type: "password-reset",
  });

  // Send reset email
  await sendPasswordResetEmail(lowerCaseEmail, otp);

  return res.status(200).json({
    message: "Password reset OTP sent to your email.",
    email: lowerCaseEmail,
  });
});

// Verify Reset OTP
export const verifyResetOTP = TryCatch(async (req, res, next) => {
  const { email, otp } = req.body;

  const lowerCaseEmail = email.toLowerCase();

  const otpRecord = await Otp.findOne({
    email: lowerCaseEmail,
    otp,
    type: "password-reset",
  });

  if (!otpRecord) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  return res.status(200).json({
    message: "OTP verified! You can now reset your password.",
    email: lowerCaseEmail,
  });
});

// Reset Password
export const resetPassword = TryCatch(async (req, res, next) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const lowerCaseEmail = email.toLowerCase();

  // Verify OTP again
  const otpRecord = await Otp.findOne({
    email: lowerCaseEmail,
    otp,
    type: "password-reset",
  });

  if (!otpRecord) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  // Find user
  const user = await skillswapuser.findOne({ email: lowerCaseEmail });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password
  user.password = hashedPassword;
  await user.save();

  // Delete OTP
  await Otp.deleteOne({ _id: otpRecord._id });

  return res.status(200).json({
    message: "Password reset successfully! You can now login.",
  });
});

// Resend OTP
export const resendOTP = TryCatch(async (req, res, next) => {
  const { email, type } = req.body; // type: 'verification' or 'password-reset'

  const lowerCaseEmail = email.toLowerCase();

  // Delete old OTPs
  await Otp.deleteMany({ email: lowerCaseEmail, type });

  // Generate new OTP
  const otp = generateOTP();

  // Save new OTP
  await Otp.create({
    email: lowerCaseEmail,
    otp,
    type,
  });

  // Send email based on type
  if (type === "verification") {
    await sendVerificationEmail(lowerCaseEmail, otp);
  } else {
    await sendPasswordResetEmail(lowerCaseEmail, otp);
  }

  return res.status(200).json({
    message: "New OTP sent successfully!",
  });
});

// ✅ FIXED LOGIN: Include emailVerified and profileCompleted
export const login = TryCatch(async (req, res, next) => {
  const { userName, password } = req.body;

  console.log(`Login attempt for username: ${userName}`);

  const user = await skillswapuser.findOne({
    userName: userName.toLowerCase(),
  });

  if (!user) {
    console.log("User not found");
    return res.status(401).json({ message: "Invalid username or password" });
  }

  console.log("User found:", user);

  // Compare the entered password with the stored hashed password
  const passwordMatch = await bcrypt.compare(password, user.password);
  console.log("Password match:", passwordMatch);

  if (!passwordMatch) {
    console.log("Invalid password");
    return res.status(401).json({ message: "Invalid username or password" });
  }

  console.log("User login successful");

  // ✅ Generate token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  // ✅ Set cookie
  setTokenCookie(res, token);

  // ✅ FIXED: Include all required fields
  return res.status(200).json({
    message: "User login successful",
    userType: "user",
    _id: user._id,
    userName: user.userName,
    firstName: user.firstName,
    lastName: user.lastName,
    emailVerified: user.isVerified || false,
    profileCompleted: user.profileCompleted || false, // Add this field to your User schema
  });
});

export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "DEPLOYMENT",
    sameSite: "strict",
  });
  return res.status(200).json({ message: "Logged out successfully" });
};
