// import express from "express";
// import { signup } from "../controllers/authController.js";
// import { signupValidator } from "../libs/authValidator.js";
// import { validationHandler } from "../libs/authValidator.js";
// import { loginValidator } from "../libs/authValidator.js";
// import { login } from "../controllers/authController.js";
// import { profile } from "../controllers/profile.js";
// import { viewProfile } from "../controllers/profile.js";
// import { uploadService } from "../controllers/uploadservice.js";
// import { servicesValidator } from "../libs/servicesValidator.js";
// import { getServices } from "../controllers/uploadservice.js";
// import { myServices } from "../controllers/uploadservice.js";
// import { deleteService } from "../controllers/deleteService.js"; // Import the deleteService controller
// import { swapCount } from "../controllers/swapCount.js"; // Import the swapCount controller
// import { getSwapCount } from "../controllers/swapCount.js"; // Import the getSwapCount controller
// import { suggestBio } from "../controllers/genaiSuggest.js";
// import { viewMultipleProfiles } from "../controllers/profile.js";
// import { protect } from "../middleware/auth.js"; // Import the auth middleware
// import { allservicesprofile } from "../controllers/profile.js";
// import { logout } from "../controllers/authController.js";
// import { createThread } from "../controllers/threadController.js";
// import { sendMessage } from "../controllers/messageController.js";
// import { getMessages } from "../controllers/messageController.js";
// // import { createSwapDetails } from "../controllers/swapController.js";
// import { swapRequest } from "../controllers/swapController.js";
// // import { getAllSwaps } from "../controllers/swapController.js";
// // import { acceptSwap } from "../controllers/swapController.js";
// // import { cancelSwap } from "../controllers/swapController.js";
// // import { completeSwap } from "../controllers/swapController.js";
// const app = express.Router();

// app.post("/signup", signupValidator, validationHandler, signup);
// app.post("/login", loginValidator, validationHandler, login);

// // the below routes can also be accessed if the user is authorized
// app.post("/submit-profile", protect, profile);
// app.get("/get-latest-profile", protect, viewProfile);
// app.post(
//   "/upload-service",
//   protect,
//   servicesValidator,
//   validationHandler,
//   uploadService
// );
// app.get("/get-all-gigs", protect, getServices);
// app.get("/get-my-gigs/:username", protect, myServices); // Fetch gigs for a specific user
// app.delete("/delete-gig/:gigId", protect, deleteService); // Fetch gigs for a specific user
// app.post("/increment-swap-count", protect, swapCount);
// app.get("/get-swap-count/:username", protect, getSwapCount); // Fetch gigs for a specific user
// app.post("/suggest-bio", protect, suggestBio);
// app.post("/get-user-profiles", protect, viewMultipleProfiles);
// app.get("/get-all-services", protect, allservicesprofile);
// app.post("/logout", logout);
// // messaging routes
// app.post("/create-thread", protect, createThread);
// app.post("/message", protect, sendMessage);
// app.get("/messages/:chatroomId", protect, getMessages);
// // app.post("/swap-details", protect, createSwapDetails);

// app.post("/swap-request", protect, swapRequest);

// // app.post("/create", protect, createSwapDetails);

// // app.get("/fetchswaps", protect, getAllSwaps);
// // app.patch("/:swapId/accept", protect, acceptSwap);
// // app.patch("/:swapId/cancel", protect, cancelSwap);
// // app.patch("/:swapId/complete", protect, completeSwap);
// export default app;

import express from "express";
import { signup } from "../controllers/authController.js";
import { signupValidator } from "../libs/authValidator.js";
import { validationHandler } from "../libs/authValidator.js";
import { loginValidator } from "../libs/authValidator.js";
import { login } from "../controllers/authController.js";
import { profile } from "../controllers/profile.js";
import { viewProfile } from "../controllers/profile.js";
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
// Add these imports to your existing imports in user.js
import {
  getReceivedSwapRequests,
  acceptSwapRequest,
  deleteSwapRequest,
} from "../controllers/swapController.js";
const app = express.Router();

// Auth routes
app.post("/signup", signupValidator, validationHandler, signup);
app.post("/login", loginValidator, validationHandler, login);
app.post("/logout", logout);

// Profile routes
app.post("/submit-profile", protect, profile);
app.get("/get-latest-profile", protect, viewProfile);
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

// SWAP ROUTES - UNCOMMENTED AND ORGANIZED
app.post("/swap-request", protect, swapRequest);
app.get("/fetchswaps", protect, getAllSwaps);
app.patch("/swaps/:swapId/accept", protect, acceptSwap);
app.patch("/swaps/:swapId/cancel", protect, cancelSwap);
app.patch("/swaps/:swapId/complete", protect, completeSwap);

// NEW ROUTES NEEDED FOR MESSAGE REQUESTS FUNCTIONALITY
// Get received swap requests for a user
app.get(
  "/api/swap-requests/received/:userId",
  protect,
  getReceivedSwapRequests
);
// Accept a swap request
app.post("/api/swap-requests/:requestId/accept", protect, acceptSwapRequest);
// Delete/reject a swap request
app.delete("/api/swap-requests/:requestId", protect, deleteSwapRequest);

export default app;
