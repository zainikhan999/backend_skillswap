// controllers/threadController.js
import Thread from "../Model/Thread.js";
import { v4 as uuidv4 } from "uuid";
import { TryCatch } from "../middleware/error.js";

export const createThread = TryCatch(async (req, res, next) => {
  const { sender, recipient, gigId } = req.body;

  if (!sender || !recipient) {
    return res.status(400).json({ message: "Sender and recipient required" });
  }

  try {
    // Check if thread exists
    const existingThread = await Thread.findOne({
      participants: { $all: [sender, recipient] },
    });

    if (existingThread) {
      return res.status(200).json({ chatroomId: existingThread.chatroomId });
    }

    const chatroomId = uuidv4();

    const thread = new Thread({
      chatroomId,
      participants: [sender, recipient],
      gigId,
    });

    await thread.save();

    res.status(201).json({ chatroomId });
  } catch (error) {
    console.error("Create Thread Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
