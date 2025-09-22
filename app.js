import dotenv from "dotenv";
import express from "express";
// import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import { connectDB } from "./utils/features.js";
import { corsOptions } from "./constants/config.js";
import authRoutes from "./routes/user.js";
import { errorMiddleware } from "./middleware/error.js"; // Import your error middleware
import Message from "./Model/Message.js";
import ChatRoom from "./Model/ChatRoom.js";
import Notification from "./Model/Notification.js";
import SwapDetails from "./Model/SwapDetails.js";
import classifyRoute from "./routes/classifyRoute.js";
import cookieParser from "cookie-parser";
import swapRoute from "./routes/swapRoute.js";
import { protect } from "./middleware/auth.js";
import csurf from "csurf";
import User from "./Model/User.js"; // Add this line
dotenv.config();
const envMode = process.env.NODE_ENV || "DEVELOPMENT";
const MONGO_URI = process.env.MONGO_URI;
connectDB(MONGO_URI);
//explain each line by line in detail
const app = express(); //create express app
const server = createServer(app); //create http server
// const io = new Server(server, {
//   origin: process.env.FRONTEND_URL,
//   cors: corsOptions, //enable cors
// });

// const io = new Server(server, {
//   cors: {
//     origin: "https://skillswap-frontend-ten.vercel.app",
//     addTrailingSlash: false,
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

app.use(cookieParser()); // ✅ Parse cookies

app.use(cors(corsOptions)); //

app.use(express.json());

// ✅ Route to get CSRF token
app.get("/api/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});
app.use(csurf({ cookie: true }));

app.use("/api", authRoutes);
app.use("/api", classifyRoute);
app.use("/api", swapRoute);

app.get("/", (req, res) => {
  res.json({ message: "Server is running", timestamp: new Date() });
});
// // ________________________________________________Socketio Connection_____________________________________________
// io.on("connection", (socket) => {
//   console.log("User connected:", socket.id);

//   // Join a specific room
//   socket.on("join_room", (room) => {
//     if (!socket.rooms.has(room)) {
//       socket.join(room);
//       console.log(`User joined room: ${room}`);
//     }
//   });

//   socket.on("my-room", (userId) => {
//     socket.data.userName = userId; // 💡 Attach the username to this socket
//     socket.join(userId); // Join personal room
//     console.log(`User ${userId} joined their room`);
//   });

//   // Handle incoming messages
//   socket.on("message", async ({ room, message, sender, recipient }) => {
//     const timestamp = new Date().toISOString();
//     const messageTimestamp = new Date().getTime();

//     // ✅ Send the message to the chat room
//     io.to(room).emit("receive_message", {
//       message,
//       sender,
//       timestamp: messageTimestamp,
//     });

//     // ✅ Check if recipient is already in the chat room
//     const socketsInRoom = await io.in(room).fetchSockets();
//     const isRecipientInRoom = socketsInRoom.some(
//       (s) => s.data.userName === recipient
//     );

//     // ❌ If recipient is in room, don't notify
//     if (isRecipientInRoom) {
//       console.log(
//         `Recipient ${recipient} is already in room: no notification.`
//       );
//       return;
//     }

//     // ✅ Otherwise, create and emit a notification
//     const newNotification = new Notification({
//       recipient,
//       message: `New message from ${sender}`,
//       timestamp: Date.now(),
//       seen: false,
//     });

//     await newNotification.save();

//     const notificationData = {
//       message: newNotification.message,
//       timestamp: newNotification.timestamp,
//       seen: false,
//       recipient: newNotification.recipient,
//       _id: newNotification._id,
//     };

//     io.to(recipient).emit("receive_notification", notificationData);
//     console.log("Sent notification to:", recipient, notificationData);
//   });

//   // Handle disconnection
//   socket.on("disconnect", () => {
//     console.log("User disconnected");
//   });
// });

// Save chat room and message, and create notification for the recipient
app.post("/message", async (req, res) => {
  try {
    const { room, sender, recipient, message } = req.body;

    if (!room || !sender || !recipient || !message) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // Save chat room if it doesn't exist
    const existingRoom = await ChatRoom.findOne({ roomId: room });
    if (!existingRoom) {
      await ChatRoom.create({
        roomId: room,
        participants: [sender, recipient],
        serviceId: "default",
      });
    }

    // Save the message
    const savedMessage = await Message.create({
      chatroomId: room,
      sender,
      receiver: recipient,
      message,
    });

    // Create the notification in the DB (no need to emit here)
    // const newNotification = new Notification({
    //   recipient: recipient,
    //   message: `New message from ${sender}`,
    //   timestamp: Date.now(),
    //   seen: false,
    // });
    // await newNotification.save();

    res.status(201).json({ success: true, message: savedMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/get-notifications", protect, async (req, res) => {
  try {
    const { recipient } = req.query;
    if (!recipient) {
      return res.status(400).json({ error: "Recipient is required" });
    }

    // Get all unread notifications for the recipient
    const notifications = await Notification.find({ recipient, seen: false });

    res.status(200).json({ notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/update-notification", protect, async (req, res) => {
  try {
    const { recipient, notificationIds } = req.body;
    console.log("Received data:", recipient, notificationIds); // Add this line to check incoming data

    if (!recipient || !notificationIds || notificationIds.length === 0) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // Update all notifications to seen for the given recipient
    await Notification.updateMany(
      { _id: { $in: notificationIds }, recipient: recipient },
      { $set: { seen: true } }
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/chats/:username", protect, async (req, res) => {
  const { username } = req.params;

  try {
    const messages = await Message.find({
      $or: [{ sender: username }, { receiver: username }],
    });

    const chatUsers = new Set();

    messages.forEach((msg) => {
      const otherUser = msg.sender === username ? msg.receiver : msg.sender;
      chatUsers.add(otherUser);
    });

    res.json([...chatUsers]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch chat users" });
  }
});

app.get("/messages/:user1/:user2", protect, async (req, res) => {
  const { user1, user2 } = req.params;

  try {
    // First, get the ObjectIds for the usernames
    const user1Doc = await User.findOne({
      $or: [{ userName: user1 }, { username: user1 }, { name: user1 }],
    });

    const user2Doc = await User.findOne({
      $or: [{ userName: user2 }, { username: user2 }, { name: user2 }],
    });

    if (!user1Doc || !user2Doc) {
      return res.status(404).json({ error: "User not found" });
    }

    const user1Id = user1Doc._id;
    const user2Id = user2Doc._id;

    console.log(
      `Looking for messages between ${user1} (${user1Id}) and ${user2} (${user2Id})`
    );

    // Now query using ObjectIds
    const messages = await Message.find({
      $or: [
        { sender: user1Id, receiver: user2Id },
        { sender: user2Id, receiver: user1Id },
        { sender: user1, receiver: user2 }, // Also check username format for backwards compatibility
        { sender: user2, receiver: user1 },
      ],
    }).sort({ timestamp: 1 });

    console.log(`Found ${messages.length} messages`);

    // Transform ObjectIds back to usernames for frontend
    const transformedMessages = messages.map((msg) => {
      const senderUsername =
        msg.sender.toString() === user1Id.toString() ? user1 : user2;
      const receiverUsername =
        msg.receiver.toString() === user1Id.toString() ? user1 : user2;

      return {
        ...msg.toObject(),
        sender: senderUsername,
        receiver: receiverUsername,
      };
    });

    res.json(transformedMessages);
  } catch (err) {
    console.error("Error in messages endpoint:", err);
    res.status(500).json({ error: "Could not fetch chat history" });
  }
});

// Route to get notifications for the logged-in user
// Route to get notifications for the logged-in user
app.get("/notifications", protect, async (req, res) => {
  try {
    const { userId } = req.query; // Retrieve the userId from the query parameter

    if (!userId) {
      return res.status(400).json({ error: "User not authenticated" });
    }

    // Fetch notifications for the logged-in user
    const notifications = await Notification.find({ recipient: userId }).sort({
      timestamp: -1,
    });

    res.status(200).json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/message/seen", protect, (req, res) => {
  const { timestamp } = req.body;
  if (!timestamp) {
    return res.status(400).json({ error: "Timestamp is required" });
  }

  // message model with a 'seen' field
  Message.updateOne(
    { timestamp }, // Find the message by timestamp (or unique ID)
    { $set: { seen: true } } // Set the 'seen' field to true
  )
    .then(() => {
      res.status(200).json({ message: "Message status updated to seen" });
    })
    .catch((err) => {
      console.error("Error updating message status:", err);
      res.status(500).json({ error: "Failed to update message status" });
    });
});

app.post("/swapform", protect, async (req, res) => {
  const {
    taskId,
    currentUser,
    recipient,
    taskName,
    timeRequired,
    description,
    deadline,
  } = req.body;

  try {
    // Check if any field is empty
    if (
      !taskId ||
      !currentUser ||
      !recipient ||
      !taskName ||
      !timeRequired ||
      !description ||
      !deadline
    ) {
      return res.status(400).json({
        success: false,
        error: "All fields must be filled.",
      });
    }

    // Check if taskId already has 2 documents
    const existingEntries = await SwapDetails.find({ taskId });

    if (existingEntries.length >= 2) {
      return res.status(400).json({
        success: false,
        error: "This task ID already has two swap entries.",
      });
    }

    // Save new swap document
    const swapDetails = new SwapDetails({
      taskId,
      currentUser,
      recipient,
      taskName,
      timeRequired,
      description,
      deadline,
    });

    await swapDetails.save();

    res.status(201).json({ success: true, swapDetails });
  } catch (error) {
    console.error("Error saving swap details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get("/get-swap-tasks", protect, async (req, res) => {
  const currentUser = req.query.currentUser;
  // fetch the task id for the current user
  try {
    const tasks = await SwapDetails.find({ currentUser });
    //match the task idwith other user dcouments in db
    const taskIds = tasks.map((task) => task.taskId);

    const otherUserTasks = await SwapDetails.find({
      taskId: { $in: taskIds },
      recipient: currentUser,
    });

    const allTasks = [...tasks, ...otherUserTasks];

    res.status(200).json({ success: true, tasks: allTasks });
  } catch (error) {
    console.error("Error fetching swap tasks:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/confirm-task", protect, async (req, res) => {
  const { taskId, currentUser } = req.body;

  try {
    // Find all tasks with that taskId
    const tasks = await SwapDetails.find({ taskId });

    // Find the task that matches the current user
    const userTask = tasks.find((task) => task.currentUser === currentUser);

    if (!userTask)
      return res.json({
        success: false,
        message: "Task not found for this user.",
      });

    userTask.isConfirmed = true;
    await userTask.save();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/delete-task", protect, async (req, res) => {
  const { taskId } = req.body;

  try {
    // Delete all tasks with the same taskId
    const deletedTasks = await SwapDetails.deleteMany({ taskId });

    if (deletedTasks.deletedCount === 0) {
      return res.json({
        success: false,
        message: "No tasks found with the given taskId",
      });
    }

    res.json({ success: true, deletedCount: deletedTasks.deletedCount });
  } catch (error) {
    console.error("Error deleting tasks:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// error middle ware at the end
app.use(errorMiddleware);

if (process.env.NODE_ENV !== "DEPLOYMENT") {
  server.listen(5000, () => {
    console.log("Server is running on port 5000");
  });
}

export default app;
export { envMode };
