// controllers/swapController.js
import SwapDetails from "../Model/SwapDetails.js";
import { TryCatch } from "../middleware/error.js";
import { v4 as uuidv4 } from "uuid";
import Message from "../Model/Message.js";
import mongoose from "mongoose";
import User from "../Model/User.js";

// controllers/swapController.js - Fix the acceptSwapRequest function

export const acceptSwapRequest = TryCatch(async (req, res, next) => {
  const { requestId } = req.params;
  const userId = req.user._id;

  // Get responder task details from frontend (swap form modal)
  const { taskName, timeRequired, description, deadline } = req.body;

  console.log("User ID from auth:", userId.toString());
  console.log("Responder task details:", {
    taskName,
    timeRequired,
    description,
    deadline,
  });

  try {
    const swapRequest = await SwapDetails.findById(requestId);

    if (!swapRequest) {
      return res.status(404).json({ message: "Swap request not found" });
    }

    // Authorization logic (keeping your existing logic)
    const currentUserId = userId.toString();
    const currentUserUsername =
      req.user.username || req.user.userName || req.user.name;
    let responderId = swapRequest.responder.userId.toString();

    console.log("Accept comparison:");
    console.log("  Current user ID:", currentUserId);
    console.log("  Current user username:", currentUserUsername);
    console.log("  Responder:", responderId);

    let isResponder = false;
    if (responderId === currentUserId) {
      isResponder = true;
      console.log("  Matched by user ID");
    } else if (currentUserUsername && responderId === currentUserUsername) {
      isResponder = true;
      console.log("  Matched by username");
    } else {
      if (responderId && !responderId.match(/^[0-9a-fA-F]{24}$/)) {
        console.log("  Responder appears to be username, checking database...");
        const responderUser = await User.findOne({
          $or: [
            { username: responderId },
            { userName: responderId },
            { name: responderId },
          ],
        });
        if (responderUser && responderUser._id.toString() === currentUserId) {
          isResponder = true;
          console.log("  Responder matched via database lookup");
        }
      }
    }

    if (!isResponder) {
      return res.status(403).json({
        message: "Unauthorized to accept this request",
        debug: {
          currentUser: currentUserId,
          currentUsername: currentUserUsername,
          responder: responderId,
        },
      });
    }

    // 1. Update SwapDetails with responder info
    const updatedSwap = await SwapDetails.findByIdAndUpdate(
      requestId,
      {
        $set: {
          "responder.taskName": taskName,
          "responder.timeRequired": timeRequired,
          "responder.description": description,
          "responder.deadline": deadline,
          status: "accepted",
          isConfirmed: true,
        },
      },
      { new: true }
    )
      .populate("requester.userId", "userName")
      .populate("responder.userId", "userName");

    // 2. Create properly structured swap details message
    const chatroomId = [swapRequest.requester.userId.toString(), currentUserId]
      .sort()
      .join("_");

    // Structure the swapData properly for frontend consumption
    const swapDataStructure = {
      swapId: updatedSwap.swapId,
      status: "accepted",
      requesterTask: {
        taskId: swapRequest.requester.taskId,
        taskName: swapRequest.requester.taskName,
        description: swapRequest.requester.description,
        timeRequired: swapRequest.requester.timeRequired,
        deadline: swapRequest.requester.deadline,
      },
      responderTask: {
        taskName: taskName,
        description: description,
        timeRequired: timeRequired,
        deadline: deadline,
      },
    };

    const swapDetailsMessage = new Message({
      chatroomId,
      sender: currentUserId,
      receiver: swapRequest.requester.userId.toString(),
      message: `Swap Agreement: ${swapRequest.requester.taskName} ↔ ${taskName}`,
      type: "swap_details", // New type for special display
      isSwapRequest: false,
      status: "accepted",
      // Store the structured swapData - this is what frontend expects
      swapData: swapDataStructure,
      // Also keep existing fields for backward compatibility
      taskName: `${swapRequest.requester.taskName} ↔ ${taskName}`,
      description: `Requester: ${swapRequest.requester.description}\n\nResponder: ${description}`,
      swapId: updatedSwap.swapId,
    });

    await swapDetailsMessage.save();

    return res.status(200).json({
      message: "Swap request accepted successfully",
      swapId: updatedSwap.swapId,
      swapDetails: {
        requester: updatedSwap.requester,
        responder: {
          userId: currentUserId,
          taskName,
          timeRequired,
          description,
          deadline,
        },
      },
    });
  } catch (error) {
    console.error("Error accepting swap request:", error);
    return res.status(500).json({ message: "Failed to accept swap request" });
  }
});

export const getAllSwaps = TryCatch(async (req, res, next) => {
  const userId = req.user._id;

  const swaps = await SwapDetails.find({
    $or: [{ "requester.userId": userId }, { "responder.userId": userId }],
  })
    .populate("requester.userId", "userName profileImage firstName lastName")
    .populate("responder.userId", "userName profileImage firstName lastName");

  console.log("Found swaps:", swaps.length);

  return res.status(200).json({
    message: "All swaps fetched successfully",
    swaps,
  });
});

export const acceptSwap = TryCatch(async (req, res, next) => {
  const { swapId } = req.params;
  const userId = req.user._id;
  const { taskId, taskName, timeRequired, description, deadline } = req.body;

  const updatedSwap = await SwapDetails.findOneAndUpdate(
    { swapId },
    {
      $set: {
        responder: {
          userId,
          taskId,
          taskName,
          timeRequired,
          description,
          deadline,
        },
        status: "accepted",
        isConfirmed: true,
      },
    },
    { new: true }
  );

  if (!updatedSwap) {
    return res.status(404).json({ message: "Swap not found" });
  }

  return res.status(200).json({
    message: "Swap accepted",
    swap: updatedSwap,
  });
});

export const cancelSwap = TryCatch(async (req, res, next) => {
  const { swapId } = req.params;

  const cancelledSwap = await SwapDetails.findOneAndUpdate(
    { swapId },
    { status: "cancelled", closedAt: new Date() },
    { new: true }
  );

  if (!cancelledSwap) {
    return res.status(404).json({ message: "Swap not found" });
  }

  return res.status(200).json({
    message: "Swap cancelled",
    swap: cancelledSwap,
  });
});

export const completeSwap = TryCatch(async (req, res, next) => {
  const { swapId } = req.params;

  const completedSwap = await SwapDetails.findOneAndUpdate(
    { swapId },
    { status: "completed", closedAt: new Date() },
    { new: true }
  );

  if (!completedSwap) {
    return res.status(404).json({ message: "Swap not found" });
  }

  return res.status(200).json({
    message: "Swap marked as completed",
    swap: completedSwap,
  });
});

export const getReceivedSwapRequests = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log("Getting swap requests for userId:", userId);

    let actualUserId;

    // Check if userId is ObjectId or username
    if (mongoose.Types.ObjectId.isValid(userId)) {
      actualUserId = new mongoose.Types.ObjectId(userId);
    } else {
      const user = await User.findOne({
        $or: [{ userName: userId }, { username: userId }, { name: userId }],
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      actualUserId = user._id;
      console.log("Converted username to ObjectId:", actualUserId.toString());
    }

    // Fetch swap requests + populate requester info
    const swapRequests = await SwapDetails.find({
      "responder.userId": actualUserId,
      status: "pending",
    })
      .populate("requester.userId", "userName firstName lastName")
      .sort({ createdAt: -1 });

    console.log("Requests found:", swapRequests.length);

    // Format for frontend
    const formattedRequests = swapRequests.map((swap) => ({
      id: swap._id,
      user: swap.requester.userId?.userName || "Unknown User",
      taskName: swap.requester.taskName,
      description: swap.requester.description,
      deadline: swap.requester.deadline,
      timeRequired: swap.requester.timeRequired,
      timestamp: swap.createdAt,
      status: swap.status,
      swapId: swap.swapId,
      requesterInfo: {
        id: swap.requester.userId?._id,
        userName: swap.requester.userId?.userName,
        firstName: swap.requester.userId?.firstName,
        lastName: swap.requester.userId?.lastName,
      },
    }));

    return res.status(200).json(formattedRequests);
  } catch (error) {
    console.error("Error fetching received swap requests:", error);
    return res.status(500).json({
      message: "Failed to fetch swap requests",
      error: error.message,
    });
  }
};

export const deleteSwapRequest = TryCatch(async (req, res, next) => {
  const { requestId } = req.params;
  const userId = req.user._id;

  console.log("User ID from auth:", userId.toString());

  try {
    const swapRequest = await SwapDetails.findById(requestId);

    if (!swapRequest) {
      return res.status(404).json({ message: "Swap request not found" });
    }

    // Authorization logic
    const currentUserId = userId.toString();
    const currentUserUsername =
      req.user.username || req.user.userName || req.user.name;
    const requesterId = swapRequest.requester.userId.toString();
    let responderId = swapRequest.responder.userId.toString();

    console.log("Comparison values:");
    console.log("  Current user ID:", currentUserId);
    console.log("  Current user username:", currentUserUsername);
    console.log("  Requester:", requesterId);
    console.log("  Responder:", responderId);

    // Check if responder is stored as username instead of ObjectId
    let isResponder = false;
    if (responderId === currentUserId) {
      isResponder = true;
    } else if (currentUserUsername && responderId === currentUserUsername) {
      isResponder = true;
      console.log("  Responder matched by username");
    } else {
      if (responderId && !responderId.match(/^[0-9a-fA-F]{24}$/)) {
        console.log("  Responder appears to be username, checking database...");
        const responderUser = await User.findOne({
          $or: [
            { username: responderId },
            { userName: responderId },
            { name: responderId },
          ],
        });
        if (responderUser && responderUser._id.toString() === currentUserId) {
          isResponder = true;
          console.log("  Responder matched via database lookup");
        }
      }
    }

    const isRequester = requesterId === currentUserId;

    console.log("  Is requester?", isRequester);
    console.log("  Is responder?", isResponder);

    // Check authorization - user must be either requester or responder
    if (!isRequester && !isResponder) {
      return res.status(403).json({
        message: "Unauthorized to delete this request",
        debug: {
          currentUser: currentUserId,
          currentUsername: currentUserUsername,
          requester: requesterId,
          responder: responderId,
        },
      });
    }

    // Update status to cancelled
    swapRequest.status = "cancelled";
    swapRequest.closedAt = new Date();
    await swapRequest.save();

    // Create system message
    const chatroomId = [requesterId, responderId].sort().join("_");

    const cancellationMessage = new Message({
      chatroomId,
      sender: userId,
      receiver: isRequester
        ? swapRequest.responder.userId
        : swapRequest.requester.userId,
      message: `Swap request for "${swapRequest.requester.taskName}" has been declined.`,
      isSwapRequest: false,
      type: "system",
    });

    await cancellationMessage.save();

    return res.status(200).json({
      message: "Swap request deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting swap request:", error);
    return res.status(500).json({ message: "Failed to delete swap request" });
  }
});

export const swapRequest = TryCatch(async (req, res, next) => {
  const currentUser = req.user._id;

  const { recipient, taskName, description, timeRequired, deadline, taskId } =
    req.body;

  console.log("Creating swap request:");
  console.log("  Current user (requester):", currentUser.toString());
  console.log("  Recipient (responder):", recipient);
  console.log("  Recipient type:", typeof recipient);

  // Ensure recipient is converted to ObjectId if it's a string
  let recipientId;
  if (typeof recipient === "string" && recipient.match(/^[0-9a-fA-F]{24}$/)) {
    recipientId = new mongoose.Types.ObjectId(recipient);
  } else if (typeof recipient === "string") {
    const recipientUser = await User.findOne({ userName: recipient });
    if (!recipientUser) {
      return res.status(404).json({ message: "Recipient user not found" });
    }
    recipientId = recipientUser._id;
  } else {
    recipientId = recipient;
  }

  console.log("  Final recipient ID:", recipientId.toString());

  // Check if a similar swap already exists
  const existingSwap = await SwapDetails.findOne({
    "requester.taskId": taskId,
    "requester.userId": currentUser,
    "responder.userId": recipientId,
    status: { $in: ["pending", "accepted"] },
  });

  if (existingSwap) {
    return res.status(200).json({
      message: "Swap already exists",
      swapId: existingSwap.swapId,
    });
  }

  // Create new swap record
  const newSwap = new SwapDetails({
    swapId: uuidv4(),
    requester: {
      userId: currentUser,
      taskId,
      taskName,
      timeRequired,
      description,
      deadline,
    },
    responder: {
      userId: recipientId,
    },
    status: "pending",
  });

  await newSwap.save();

  // Create message in chat
  const chatroomId = [currentUser.toString(), recipientId.toString()]
    .sort()
    .join("_");

  const swapMessage = new Message({
    chatroomId,
    sender: currentUser,
    receiver: recipientId,
    message: `Swap Request: ${taskName}`,
    type: "swap",
    isSwapRequest: true,
    status: "pending",
    taskName,
    description,
    deadline,
    timeRequired,
    swapId: newSwap.swapId,
  });

  await swapMessage.save();

  return res.status(201).json({
    message: "Swap request created and chat message sent",
    swapId: newSwap.swapId,
    chatroomId,
  });
});

export const swapRequestUpdated = TryCatch(async (req, res, next) => {
  const currentUser = req.user._id;

  const { recipient, taskName, description, timeRequired, deadline, taskId } =
    req.body;

  console.log("Creating updated swap request:");
  console.log("  Current user (requester):", currentUser.toString());
  console.log("  Recipient (responder):", recipient);
  console.log("  Recipient type:", typeof recipient);

  // Ensure recipient is converted to ObjectId if it's a string
  let recipientId;
  if (typeof recipient === "string" && recipient.match(/^[0-9a-fA-F]{24}$/)) {
    recipientId = new mongoose.Types.ObjectId(recipient);
  } else if (typeof recipient === "string") {
    const recipientUser = await User.findOne({ userName: recipient });
    if (!recipientUser) {
      return res.status(404).json({ message: "Recipient user not found" });
    }
    recipientId = recipientUser._id;
  } else {
    recipientId = recipient;
  }

  console.log("  Final recipient ID:", recipientId.toString());

  // Check if a similar swap already exists
  const existingSwap = await SwapDetails.findOne({
    "requester.userId": currentUser,
    "responder.userId": recipientId,
    status: { $in: ["pending", "accepted"] },
  });

  if (existingSwap) {
    return res.status(200).json({
      message: "Swap request already exists",
      swapId: existingSwap.swapId,
    });
  }

  // Create new swap record
  const newSwap = new SwapDetails({
    swapId: uuidv4(),
    requester: {
      userId: currentUser,
      taskId,
      taskName,
      timeRequired,
      description,
      deadline,
    },
    responder: {
      userId: recipientId,
    },
    status: "pending",
  });

  await newSwap.save();

  // Create message in chat as a swap request type
  const chatroomId = [currentUser.toString(), recipientId.toString()]
    .sort()
    .join("_");

  const swapMessage = new Message({
    chatroomId,
    sender: currentUser,
    receiver: recipientId,
    message: `Swap Request: ${taskName}`,
    type: "swap",
    isSwapRequest: true,
    status: "pending",
    taskName,
    description,
    deadline,
    timeRequired,
    swapId: newSwap.swapId,
  });

  await swapMessage.save();

  return res.status(201).json({
    message: "Swap request created successfully",
    swapId: newSwap.swapId,
    chatroomId,
  });
});
