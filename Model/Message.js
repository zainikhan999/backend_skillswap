import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    chatroomId: {
      type: String,
      required: true,
    },
    sender: {
      type: String,
      required: true,
    },
    receiver: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    seen: {
      type: Boolean,
      default: false,
    },
    // NEW FIELDS FOR SWAP REQUESTS
    type: {
      type: String,
      enum: ["message", "swap", "system", "swap_details"],
      default: "message",
    },
    isSwapRequest: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: null,
    },
    // Swap-specific fields
    taskName: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    swapData: { type: mongoose.Schema.Types.Mixed },
    deadline: {
      type: Date,
      default: null,
    },
    timeRequired: {
      type: Number,
      default: null,
    },
    swapId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", MessageSchema);
export default Message;
