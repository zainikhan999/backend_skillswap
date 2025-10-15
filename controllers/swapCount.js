// import User from "../Model/User.js";
// import { TryCatch } from "../middleware/error.js";

// // Manual increment endpoint (keep for admin use)
// export const swapCount = TryCatch(async (req, res, next) => {
//   const currentUser = req.user.userName;
//   const { users } = req.body;

//   if (!currentUser) {
//     return res.status(401).json({ success: false, message: "Unauthorized" });
//   }

//   if (!users || users.length !== 2 || !users.includes(currentUser)) {
//     return res.status(400).json({
//       success: false,
//       message:
//         "You can only increment swap involving yourself and one other user",
//     });
//   }

//   const otherUser = users.find((u) => u !== currentUser);

//   const result = await User.updateMany(
//     {
//       userName: { $in: [currentUser, otherUser] },
//     },
//     { $inc: { swapscount: 1 } }
//   );

//   return res.status(200).json({
//     success: true,
//     message: "Swap count updated for users",
//     matchedUsers: result.matchedCount,
//     modifiedUsers: result.modifiedCount,
//   });
// });

// // Get swap count for a user
// export const getSwapCount = TryCatch(async (req, res, next) => {
//   const username = req.params.username.toLowerCase();
//   const user = await User.findOne({ userName: username });

//   if (!user) {
//     return res.status(404).json({ message: "User not found" });
//   }

//   res.json({ swapCount: user.swapscount || 0 });
// });

// // Sync all swap counts based on completed swaps
// export const syncSwapCounts = TryCatch(async (req, res, next) => {
//   try {
//     console.log("🔄 Starting swap count synchronization...");

//     // Get all users
//     const users = await User.find({});
//     console.log(`📊 Found ${users.length} users`);

//     // Get all completed swaps
//     const completedSwaps = await Swap.find({ status: "completed" })
//       .populate("requester.userId")
//       .populate("responder.userId");
//     console.log(`✅ Found ${completedSwaps.length} completed swaps`);

//     // Count swaps for each user
//     const swapCountMap = {};

//     completedSwaps.forEach((swap) => {
//       const requesterUsername = swap.requester.userId?.userName;
//       const responderUsername = swap.responder.userId?.userName;

//       if (requesterUsername) {
//         swapCountMap[requesterUsername] =
//           (swapCountMap[requesterUsername] || 0) + 1;
//       }
//       if (responderUsername) {
//         swapCountMap[responderUsername] =
//           (swapCountMap[responderUsername] || 0) + 1;
//       }
//     });

//     console.log("📈 Swap count map:", swapCountMap);

//     // Update all users with correct swap counts
//     const updatePromises = users.map((user) => {
//       const correctCount = swapCountMap[user.userName] || 0;
//       return User.updateOne(
//         { _id: user._id },
//         { $set: { swapscount: correctCount } }
//       );
//     });

//     await Promise.all(updatePromises);

//     console.log("✅ Swap counts synchronized successfully!");

//     return res.status(200).json({
//       success: true,
//       message: "Swap counts synchronized successfully",
//       usersUpdated: users.length,
//       completedSwaps: completedSwaps.length,
//       swapCountMap,
//     });
//   } catch (error) {
//     console.error("❌ Error syncing swap counts:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Error syncing swap counts",
//       error: error.message,
//     });
//   }
// });

// swapCount.js - Complete file with all functions

import User from "../Model/User.js";
import SwapDetails from "../Model/SwapDetails.js"; // ✅ Import SwapDetails instead of Swap
import { TryCatch } from "../middleware/error.js";

// Manual increment endpoint (keep for admin use)
export const swapCount = TryCatch(async (req, res, next) => {
  const currentUser = req.user.userName;
  const { users } = req.body;

  if (!currentUser) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  if (!users || users.length !== 2 || !users.includes(currentUser)) {
    return res.status(400).json({
      success: false,
      message:
        "You can only increment swap involving yourself and one other user",
    });
  }

  const otherUser = users.find((u) => u !== currentUser);

  const result = await User.updateMany(
    {
      userName: { $in: [currentUser, otherUser] },
    },
    { $inc: { swapscount: 1 } }
  );

  return res.status(200).json({
    success: true,
    message: "Swap count updated for users",
    matchedUsers: result.matchedCount,
    modifiedUsers: result.modifiedCount,
  });
});

// Get swap count for a user
export const getSwapCount = TryCatch(async (req, res, next) => {
  const username = req.params.username.toLowerCase();
  const user = await User.findOne({ userName: username });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({ swapCount: user.swapscount || 0 });
});

// ✅ Sync all swap counts based on completed swaps
export const syncSwapCounts = TryCatch(async (req, res, next) => {
  try {
    console.log("🔄 Starting swap count synchronization...");

    // Get all users
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users`);

    // ✅ Get all completed swaps using SwapDetails model
    const completedSwaps = await SwapDetails.find({ status: "completed" })
      .populate("requester.userId", "userName")
      .populate("responder.userId", "userName");
    console.log(`✅ Found ${completedSwaps.length} completed swaps`);

    // Count swaps for each user
    const swapCountMap = {};

    completedSwaps.forEach((swap) => {
      const requesterUsername = swap.requester.userId?.userName;
      const responderUsername = swap.responder.userId?.userName;

      if (requesterUsername) {
        swapCountMap[requesterUsername] =
          (swapCountMap[requesterUsername] || 0) + 1;
      }
      if (responderUsername) {
        swapCountMap[responderUsername] =
          (swapCountMap[responderUsername] || 0) + 1;
      }
    });

    console.log("📈 Swap count map:", swapCountMap);

    // Update all users with correct swap counts
    const updatePromises = users.map((user) => {
      const correctCount = swapCountMap[user.userName] || 0;
      return User.updateOne(
        { _id: user._id },
        { $set: { swapscount: correctCount } }
      );
    });

    await Promise.all(updatePromises);

    console.log("✅ Swap counts synchronized successfully!");

    return res.status(200).json({
      success: true,
      message: "Swap counts synchronized successfully",
      usersUpdated: users.length,
      completedSwaps: completedSwaps.length,
      swapCountMap,
    });
  } catch (error) {
    console.error("❌ Error syncing swap counts:", error);
    return res.status(500).json({
      success: false,
      message: "Error syncing swap counts",
      error: error.message,
    });
  }
});
