// api/socket.js - Put this exact code in your api/socket.js file

import { Server } from "socket.io";
import Message from "../Model/Message.js";
import Notification from "../Model/Notification.js";
import ChatRoom from "../Model/ChatRoom.js";
import { connectDB } from "../utils/features.js";
dotenv.config();
const MONGO_URI = process.env.MONGO_URI;
connectDB(MONGO_URI);

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log("Socket is already running");
  } else {
    console.log("Socket is initializing");

    // Create Socket.IO server with Vercel-compatible settings
    const io = new Server(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        origin: "https://skillswap-frontend-ten.vercel.app",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    res.socket.server.io = io;

    // COPY ALL YOUR SOCKET CONNECTION CODE FROM app.js HERE:
    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      // Join a specific room
      socket.on("join_room", (room) => {
        if (!socket.rooms.has(room)) {
          socket.join(room);
          console.log(`User joined room: ${room}`);
        }
      });

      socket.on("my-room", (userId) => {
        socket.data.userName = userId;
        socket.join(userId);
        console.log(`User ${userId} joined their room`);
      });

      // Handle incoming messages
      socket.on("message", async ({ room, message, sender, recipient }) => {
        const timestamp = new Date().toISOString();
        const messageTimestamp = new Date().getTime();

        // Send the message to the chat room
        io.to(room).emit("receive_message", {
          message,
          sender,
          timestamp: messageTimestamp,
        });

        // Check if recipient is already in the chat room
        const socketsInRoom = await io.in(room).fetchSockets();
        const isRecipientInRoom = socketsInRoom.some(
          (s) => s.data.userName === recipient
        );

        // If recipient is in room, don't notify
        if (isRecipientInRoom) {
          console.log(
            `Recipient ${recipient} is already in room: no notification.`
          );
          return;
        }

        // Otherwise, create and emit a notification
        const newNotification = new Notification({
          recipient,
          message: `New message from ${sender}`,
          timestamp: Date.now(),
          seen: false,
        });

        await newNotification.save();

        const notificationData = {
          message: newNotification.message,
          timestamp: newNotification.timestamp,
          seen: false,
          recipient: newNotification.recipient,
          _id: newNotification._id,
        };

        io.to(recipient).emit("receive_notification", notificationData);
        console.log("Sent notification to:", recipient, notificationData);
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log("User disconnected");
      });
    });
  }

  res.end();
};

export default SocketHandler;
