import mongoose from "mongoose";

const SwapDetailsSchema = new mongoose.Schema(
  {
    taskId: {
      type: String,
      required: true,
    },
    currentUser: {
      type: String,
      required: true,
    },
    recipient: {
      type: String,
      required: true,
    },
    taskName: {
      type: String,
      required: true,
    },
    timeRequired: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const SwapDetails = mongoose.model("swapdetails", SwapDetailsSchema);

export default SwapDetails;
