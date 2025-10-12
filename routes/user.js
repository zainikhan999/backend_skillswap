import express from "express";
import { signup } from "../controllers/authController.js";
import { signupValidator } from "../libs/authValidator.js";
import { validationHandler } from "../libs/authValidator.js";
import { loginValidator } from "../libs/authValidator.js";
import { login } from "../controllers/authController.js";
import {
  profile,
  updateProfile,
  deleteProfile,
  viewProfile,
} from "../controllers/profile.js";
import { uploadService } from "../controllers/uploadservice.js";
import { servicesValidator } from "../libs/servicesValidator.js";
import { getServices } from "../controllers/uploadservice.js";
import { myServices } from "../controllers/uploadservice.js";
import { deleteService } from "../controllers/deleteService.js";
import { swapCount } from "../controllers/swapCount.js";
import { getSwapCount } from "../controllers/swapCount.js";
import { suggestBio } from "../controllers/genaiSuggest.js";
import { viewMultipleProfiles } from "../controllers/profile.js";
import { protect } from "../middleware/auth.js";
import { allservicesprofile } from "../controllers/profile.js";
import { logout } from "../controllers/authController.js";
import { createThread } from "../controllers/threadController.js";
import { sendMessage } from "../controllers/messageController.js";
import { getMessages } from "../controllers/messageController.js";
import { swapRequest } from "../controllers/swapController.js";
import { getAllSwaps } from "../controllers/swapController.js";
import { acceptSwap } from "../controllers/swapController.js";
import { cancelSwap } from "../controllers/swapController.js";
import { completeSwap } from "../controllers/swapController.js";
import {
  getReceivedSwapRequests,
  acceptSwapRequest,
  deleteSwapRequest,
} from "../controllers/swapController.js";
import {
  verifyEmail,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  resendOTP,
} from "../controllers/authController.js";
const app = express.Router();

// Auth routes
app.post("/signup", signupValidator, validationHandler, signup);
app.post("/login", loginValidator, validationHandler, login);
app.post("/logout", logout);

// Profile routes - UPDATED WITH NEW ENDPOINTS
app.post("/submit-profile", protect, profile);
app.get("/get-latest-profile", protect, viewProfile);
app.put("/update-profile", protect, updateProfile); // NEW: Update profile
app.delete("/delete-profile", protect, deleteProfile); // NEW: Delete profile
app.post("/get-user-profiles", protect, viewMultipleProfiles);
app.get("/get-all-services", protect, allservicesprofile);

// Service routes
app.post(
  "/upload-service",
  protect,
  servicesValidator,
  validationHandler,
  uploadService
);
app.get("/get-all-gigs", protect, getServices);
app.get("/get-my-gigs/:username", protect, myServices);
app.delete("/delete-gig/:gigId", protect, deleteService);

// Swap count routes
app.post("/increment-swap-count", protect, swapCount);
app.get("/get-swap-count/:username", protect, getSwapCount);

// AI suggestion routes
app.post("/suggest-bio", protect, suggestBio);

// Messaging routes
app.post("/create-thread", protect, createThread);
app.post("/message", protect, sendMessage);
app.get("/messages/:chatroomId", protect, getMessages);

// SWAP ROUTES
app.post("/swap-request", protect, swapRequest);
app.get("/fetchswaps", protect, getAllSwaps);
app.patch("/swaps/:swapId/accept", protect, acceptSwap);
app.patch("/swaps/:swapId/cancel", protect, cancelSwap);
app.patch("/swaps/:swapId/complete", protect, completeSwap);

// Swap request routes
app.get(
  "/api/swap-requests/received/:userId",
  protect,
  getReceivedSwapRequests
);
app.post("/api/swap-requests/:requestId/accept", protect, acceptSwapRequest);
app.delete("/api/swap-requests/:requestId", protect, deleteSwapRequest);
// Email verification routes
app.post("/verify-email", verifyEmail);
app.post("/resend-otp", resendOTP);

// Password reset routes
app.post("/forgot-password", forgotPassword);
app.post("/verify-reset-otp", verifyResetOTP);
app.post("/reset-password", resetPassword);
export default app;
