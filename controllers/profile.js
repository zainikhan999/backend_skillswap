import SkillForm from "../Model/SkillForm.js";
import { TryCatch } from "../middleware/error.js";

export const profile = TryCatch(async (req, res, next) => {
  const { name, username, city, contactNumber, bio, skills, profileImage } =
    req.body;

  console.log("Received profileImage:", profileImage); // Log to check if the image URL is received
  if (
    !name ||
    !username ||
    !city ||
    !contactNumber ||
    !bio ||
    !skills ||
    !Array.isArray(skills)
  ) {
    return res.status(400).json({
      message: "All fields are required, and skills must be an array",
    });
  }

  try {
    const newProfile = new SkillForm({
      name,
      username,
      city,
      contactNumber,
      bio,
      profileImage,
      skills,
    });
    await newProfile.save();
    res.status(201).json({ message: "Profile submitted successfully" });
  } catch (error) {
    next(error);
  }
});

export const viewProfile = TryCatch(async (req, res, next) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ message: "Username is required." });
  }

  try {
    const userProfile = await SkillForm.findOne({ username }); // Find by provided username
    if (!userProfile) {
      return res
        .status(404)
        .json({ message: "Profile not found for this user" });
    }

    res.json(userProfile);
  } catch (error) {
    next(error);
  }
});

export const viewMultipleProfiles = TryCatch(async (req, res, next) => {
  const { usernames } = req.body; // Expect an array of usernames in POST body

  if (!usernames || !Array.isArray(usernames) || usernames.length === 0) {
    return res.status(400).json({ message: "Usernames array is required." });
  }

  try {
    const userProfiles = await SkillForm.find({
      username: { $in: usernames },
    });

    res.json(userProfiles);
  } catch (error) {
    next(error);
  }
});
