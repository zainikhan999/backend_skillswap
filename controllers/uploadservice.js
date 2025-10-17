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

export const updateService = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const { skillName, skillDescription, exchangeService, category } = req.body;

  try {
    const service = await Services.findById(id);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    if (req.user.userName.toLowerCase() !== service.username.toLowerCase()) {
      return res.status(403).json({
        message: "Access denied. You can only edit your own services.",
      });
    }

    // Validate category is not empty since it's required
    if (!category || category.trim() === "") {
      return res.status(400).json({
        message: "Category is required and cannot be empty.",
      });
    }

    const updatedService = await Services.findByIdAndUpdate(
      id,
      {
        skillName,
        skillDescription,
        exchangeService,
        category: category.trim(), // Trim whitespace
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Service updated successfully!",
      service: updatedService,
    });
  } catch (error) {
    next(error);
  }
});
