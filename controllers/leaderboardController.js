// controllers/leaderboardController.js
import SwapDetails from "../Model/SwapDetails.js";
import User from "../Model/User.js";
import SkillForm from "../Model/SkillForm.js";
import { TryCatch } from "../middleware/error.js";

// Helper function to assign badges based on swap count
const getBadge = (swapCount) => {
  if (swapCount >= 30) return { name: "Legend", icon: "🏆", color: "gold" };
  if (swapCount >= 20) return { name: "Elite", icon: "💎", color: "purple" };
  if (swapCount >= 10)
    return { name: "Star Helper", icon: "💫", color: "blue" };
  if (swapCount >= 5) return { name: "Helper", icon: "⭐", color: "orange" };
  if (swapCount >= 1) return { name: "Beginner", icon: "🌟", color: "green" };
  return { name: "Newbie", icon: "🆕", color: "gray" };
};

export const getLeaderboard = TryCatch(async (req, res, next) => {
  const currentUserId = req.user._id;

  try {
    // Get ALL users from the platform
    const allUsers = await User.find({}).select(
      "_id userName firstName lastName"
    );

    // Get all swaps with their status
    const allSwaps = await SwapDetails.find({}).populate(
      "requester.userId responder.userId",
      "userName"
    );

    // Create a map to store user stats - Initialize ALL users first
    const userStatsMap = new Map();

    // Initialize stats for ALL users
    allUsers.forEach((user) => {
      userStatsMap.set(user._id.toString(), {
        userId: user._id.toString(),
        completedSwaps: 0,
        pendingSwaps: 0,
        cancelledSwaps: 0,
        hoursGiven: 0,
        hoursReceived: 0,
      });
    });

    // Process each swap
    // Process each swap
    allSwaps.forEach((swap) => {
      // Skip if swap has invalid/deleted user references
      if (!swap.requester?.userId?._id || !swap.responder?.userId?._id) {
        console.log(`Skipping swap ${swap.swapId} - deleted user reference`);
        return;
      }

      // Process requester
      const requesterId = swap.requester.userId._id.toString();
      if (userStatsMap.has(requesterId)) {
        const requesterStats = userStatsMap.get(requesterId);

        if (swap.status === "completed") {
          requesterStats.completedSwaps += 1;
          requesterStats.hoursReceived += swap.requester.timeRequired || 0;
          requesterStats.hoursGiven += swap.responder.timeRequired || 0;
        } else if (swap.status === "pending") {
          requesterStats.pendingSwaps += 1;
        } else if (swap.status === "cancelled") {
          requesterStats.cancelledSwaps += 1;
        }
      }

      // Process responder
      const responderId = swap.responder.userId._id.toString();
      if (userStatsMap.has(responderId)) {
        const responderStats = userStatsMap.get(responderId);

        if (swap.status === "completed") {
          responderStats.completedSwaps += 1;
          responderStats.hoursGiven += swap.responder.timeRequired || 0;
          responderStats.hoursReceived += swap.requester.timeRequired || 0;
        } else if (swap.status === "pending") {
          responderStats.pendingSwaps += 1;
        } else if (swap.status === "cancelled") {
          responderStats.cancelledSwaps += 1;
        }
      }
    });

    // Convert map to array and sort by completed swaps (then by pending, then by cancelled)
    let leaderboardData = Array.from(userStatsMap.values()).sort((a, b) => {
      if (b.completedSwaps !== a.completedSwaps) {
        return b.completedSwaps - a.completedSwaps;
      }
      if (b.pendingSwaps !== a.pendingSwaps) {
        return b.pendingSwaps - a.pendingSwaps;
      }
      return b.cancelledSwaps - a.cancelledSwaps;
    });

    // Get user details and profile info
    const enrichedLeaderboard = await Promise.all(
      leaderboardData.map(async (stats, index) => {
        const user = await User.findById(stats.userId).select(
          "userName firstName lastName"
        );
        const profile = await SkillForm.findOne({
          username: user?.userName,
        }).select("profileImage skills city");

        const badge = getBadge(stats.completedSwaps);
        const netBalance = stats.hoursGiven - stats.hoursReceived;

        return {
          rank: index + 1,
          userId: stats.userId,
          userName: user?.userName || "Unknown",
          firstName: user?.firstName || "",
          lastName: user?.lastName || "",
          profileImage: profile?.profileImage || null,
          city: profile?.city || "Unknown",
          skills: profile?.skills || [],
          completedSwaps: stats.completedSwaps,
          pendingSwaps: stats.pendingSwaps,
          cancelledSwaps: stats.cancelledSwaps,
          hoursGiven: stats.hoursGiven,
          hoursReceived: stats.hoursReceived,
          netBalance: netBalance,
          badge: badge,
          isCurrentUser: stats.userId === currentUserId.toString(),
        };
      })
    );

    // Find current user's position
    const currentUserIndex = enrichedLeaderboard.findIndex(
      (user) => user.userId === currentUserId.toString()
    );

    const currentUserStats =
      currentUserIndex !== -1
        ? enrichedLeaderboard[currentUserIndex]
        : {
            rank: enrichedLeaderboard.length + 1,
            userId: currentUserId.toString(),
            userName: req.user.userName,
            firstName: req.user.firstName || "",
            lastName: req.user.lastName || "",
            profileImage: null,
            city: "Unknown",
            skills: [],
            completedSwaps: 0,
            pendingSwaps: 0,
            cancelledSwaps: 0,
            hoursGiven: 0,
            hoursReceived: 0,
            netBalance: 0,
            badge: getBadge(0),
            isCurrentUser: true,
          };

    // Return all users, not just top 10
    return res.status(200).json({
      success: true,
      leaderboard: enrichedLeaderboard,
      currentUser: currentUserStats,
      totalUsers: enrichedLeaderboard.length,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch leaderboard",
    });
  }
});
