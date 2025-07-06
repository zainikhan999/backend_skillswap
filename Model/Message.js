import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  chatroomId: {
    type: String, // not a ref, just storing as plain string
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
});

const Message = mongoose.model("Message", messageSchema);
export default Message;
