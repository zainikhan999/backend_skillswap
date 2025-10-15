// routes/swapRoutes.js (or wherever your swap routes are defined)
import express from "express";
import {
  getReceivedSwapRequests,
  acceptSwapRequest,
  deleteSwapRequest,
  swapRequest,
  getAllSwaps,
  acceptSwap,
  cancelSwap,
  completeSwap,
} from "../controllers/swapController.js";
import { getSwapStatus } from "../controllers/swapController.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

// Get received swap requests for a user
router.get("/swap-requests/received/:userId", protect, getReceivedSwapRequests);

// Accept a swap request
router.post("/swap-requests/:requestId/accept", protect, acceptSwapRequest);

// Delete/reject a swap request
router.delete("/swap-requests/:requestId", protect, deleteSwapRequest);

// Other swap routes
router.post("/swap-request", protect, swapRequest);
router.get("/swaps", protect, getAllSwaps);
router.put("/swap/:swapId/accept", protect, acceptSwap);
// Complete swap route
// router.put("/swaps/:swapId/complete", protect, completeSwap);

router.put("/swaps/:swapId/complete", protect, completeSwap);
router.get("/swaps/:swapId/status", protect, getSwapStatus);

// Cancel swap route
router.put("/swaps/:swapId/cancel", protect, cancelSwap);
export default router;
