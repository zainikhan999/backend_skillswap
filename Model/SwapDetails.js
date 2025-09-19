import mongoose from "mongoose";

const SwapDetailsSchema = new mongoose.Schema(
  {
    swapId: { type: String, required: true },

    requester: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "skillswapuser", // 👈 link to User model
        required: true,
      },
      taskId: { type: String, required: true },
      taskName: { type: String, required: true },
      timeRequired: { type: Number, required: true },
      description: { type: String, required: true },
      deadline: { type: Date, required: true },
    },

    responder: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "skillswapuser", // 👈 link to User model
        required: true,
      },
      taskId: { type: String },
      taskName: { type: String },
      timeRequired: { type: Number },
      description: { type: String },
      deadline: { type: Date },
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "cancelled", "completed"],
      default: "pending",
    },

    isConfirmed: { type: Boolean, default: false },
    closedAt: { type: Date },
  },
  { timestamps: true }
);

const SwapDetails = mongoose.model("SwapDetails", SwapDetailsSchema);

export default SwapDetails;
