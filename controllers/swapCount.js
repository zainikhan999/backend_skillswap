import User from "../Model/User.js"; // or wherever your User model is
import { TryCatch } from "../middleware/error.js";
export const swapCount = TryCatch(async (req, res, next) => {
  console.log("Received increment request with body:", req.body);

  const { users } = req.body;

  if (!users || users.length !== 2) {
    return res
      .status(400)
      .json({ success: false, message: "Missing or invalid users" });
  }

  const result = await User.updateMany(
    {
      $or: users.map((username) => ({
        userName: { $regex: `^${username}$`, $options: "i" },
      })),
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
