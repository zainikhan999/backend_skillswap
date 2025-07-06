import { TryCatch } from "../middleware/error.js"; // Import the TryCatch utility
import Services from "../Model/Services.js";

export const uploadService = TryCatch(async (req, res, next) => {
  const {
    skillName,
    skillDescription,
    swapscount,
    exchangeService,
    username,
    category,
  } = req.body;

  try {
    const newGig = new Services({
      skillName,
      skillDescription,
      swapscount,
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
  const { username } = req.params; // Extract username from request parameters

  try {
    const gigs = await Services.find({ username }); // Fetch gigs for the specific user
    res.json(gigs); // Return the gigs as a JSON response
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }
});
