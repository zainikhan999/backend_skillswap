import User from "../Model/User.js"; // or wherever your User model is
import { TryCatch } from "../middleware/error.js";
export const swapCount = TryCatch(async (req, res, next) => {
  const currentUser = req.user.userName; // Provided by `protect` middleware

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

  console.log("Swap count updated for:", users);

  return res.status(200).json({
    success: true,
    message: "Swap count updated for users",
    matchedUsers: result.matchedCount,
    modifiedUsers: result.modifiedCount,
  });
});

export const getSwapCount = TryCatch(async (req, res, next) => {
  try {
    const username = req.params.username.toLowerCase();
    const user = await User.findOne({ userName: username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ swapCount: user.swapscount || 0 });
  } catch (error) {
    console.error("Error fetching swap count:", error);
    res.status(500).json({ message: "Server error" });
  }
});
