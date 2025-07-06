// models/SwapRequest.js
import mongoose from "mongoose";

const SwapRequestSchema = new mongoose.Schema({
  senderUsername: {
    type: String,
    required: true,
  },
  receiverUsername: {
    type: String,
    required: true,
  },
  serviceId: {
    type: String, // the ID of the service being requested
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const SwapRequest = mongoose.model("SwapRequest", SwapRequestSchema);
export default SwapRequest;
