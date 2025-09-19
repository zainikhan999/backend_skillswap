// controllers/messageController.js
import Message from "../Model/Message.js";
import { TryCatch } from "../middleware/error.js";

export const sendMessage = TryCatch(async (req, res, next) => {
  const { chatroomId, sender, receiver, message } = req.body;

  try {
    const newMsg = new Message({
      chatroomId,
      sender,
      receiver,
      message,
    });

    await newMsg.save();

    res.status(201).json({ message: "Message sent" });
  } catch (error) {
    console.error("Send Message Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export const getMessages = TryCatch(async (req, res, next) => {
  const { chatroomId } = req.params;

  try {
    const messages = await Message.find({ chatroomId }).sort({ timestamp: 1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error("Get Messages Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
