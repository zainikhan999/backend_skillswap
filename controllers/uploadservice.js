import { TryCatch } from "../middleware/error.js"; // Import the TryCatch utility
import Services from "../Model/Services.js";

export const uploadService = TryCatch(async (req, res, next) => {
  const { skillName, skillDescription, exchangeService, category } = req.body;

  const username = req.user.userName; // ✅ get username from authenticated token

  try {
    const newGig = new Services({
      skillName,
      skillDescription,
      swapscount: 0, // default to 0 on creation
      exchangeService,
      username,
      category,
    });

    await newGig.save();
    res.status(200).json({ message: "Gig uploaded successfully!" });
  } catch (error) {
    next(error);
  }
});

export const getServices = TryCatch(async (req, res, next) => {
  try {
    const gigs = await Services.find(); // fetch all gigs
    res.json(gigs);
  } catch (error) {
    next(error);
  }
});

export const myServices = TryCatch(async (req, res, next) => {
  const { username } = req.params;

  // Only allow user to access their own gigs
  if (req.user.userName.toLowerCase() !== username.toLowerCase()) {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const gigs = await Services.find({ username });
    res.json(gigs);
  } catch (error) {
    next(error);
  }
});
