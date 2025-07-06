import Services from "../Model/Services.js"; // Import the Services model
import { TryCatch } from "../middleware/error.js"; // Import the TryCatch utility
export const deleteService = TryCatch(async (req, res, next) => {
  const { gigId } = req.params; // Extract gigId from request parameters

  try {
    // Find and delete the gig by ID
    const deletedGig = await Services.findByIdAndDelete(gigId);

    if (!deletedGig) {
      return res.status(404).json({ message: "Gig not found" });
    }

    res.status(200).json({ message: "Gig deleted successfully" });
  } catch (error) {
    console.error("Error deleting gig:", error);
    res.status(500).json({ message: "Server error" });
  }
});
