import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipient: String,
  sender: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
  seen: { type: Boolean, default: false },
});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
