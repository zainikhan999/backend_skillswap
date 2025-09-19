// models/Thread.js
import mongoose from "mongoose";

const ThreadSchema = new mongoose.Schema(
  {
    chatroomId: {
      type: String,
      required: true,
      unique: true,
    },
    participants: {
      type: [String], // sender and receiver usernames
      validate: (v) => v.length === 2,
      required: true,
    },
    gigId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gig", // Reference to the exchanged gig
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "in-progress", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Thread || mongoose.model("Thread", ThreadSchema);
