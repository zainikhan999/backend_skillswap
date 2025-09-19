import Services from "../Model/Services.js";
import { TryCatch } from "../middleware/error.js";

export const deleteService = TryCatch(async (req, res, next) => {
  const { gigId } = req.params;
  const username = req.user?.userName;

  if (!username) {
    return res.status(401).json({ message: "Unauthorized. Login required." });
  }

  // Find the gig by ObjectId
  const gig = await Services.findById(gigId); // ✅ This expects a valid ObjectId

  if (!gig) {
    return res.status(404).json({ message: "Gig not found" });
  }

  // Verify ownership
  if (gig.username !== username) {
    return res.status(403).json({ message: "Not allowed to delete this gig" });
  }

  await gig.deleteOne();
  res.status(200).json({ message: "Gig deleted successfully" });
});
