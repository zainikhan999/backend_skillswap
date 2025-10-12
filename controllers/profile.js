import SkillForm from "../Model/SkillForm.js";
import { TryCatch } from "../middleware/error.js";
import skillswapuser from "../Model/User.js"; // ✅ ADD THIS IMPORT

import dotenv from "dotenv";
dotenv.config();
import pkg from "cloudinary";
const { v2: cloudinary } = pkg;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// export const profile = TryCatch(async (req, res, next) => {
//   const { name, city, contactNumber, bio, skills, profileImage } = req.body;

//   // ✅ Use authenticated username
//   const username = req.user.userName;

//   if (
//     !name ||
//     !city ||
//     !contactNumber ||
//     !bio ||
//     !skills ||
//     !Array.isArray(skills)
//   ) {
//     return res.status(400).json({
//       message: "All fields are required, and skills must be an array",
//     });
//   }

//   try {
//     const newProfile = new SkillForm({
//       name,
//       username, // ✅ taken from token
//       city,
//       contactNumber,
//       bio,
//       profileImage,
//       skills,
//     });

//     await newProfile.save();

//     res.status(201).json({ message: "Profile submitted successfully" });
//   } catch (error) {
//     next(error);
//   }
// });
export const profile = TryCatch(async (req, res, next) => {
  const { name, city, contactNumber, bio, skills, profileImage } = req.body;

  // ✅ Use authenticated username from token
  const username = req.user.userName;

  console.log("📝 Creating profile for user:", username);

  if (
    !name ||
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
    // ✅ Check if profile already exists
    const existingProfile = await SkillForm.findOne({ username });
    if (existingProfile) {
      return res.status(400).json({
        message: "Profile already exists. Use update endpoint to modify.",
      });
    }

    // Create new profile
    const newProfile = new SkillForm({
      name,
      username,
      city,
      country: "Pakistan", // Default country
      contactNumber,
      bio,
      profileImage: profileImage || "",
      skills,
    });

    await newProfile.save();
    console.log("✅ Profile created in SkillForm collection");

    // ✅ CRITICAL: Update user's profileCompleted status
    const user = await skillswapuser.findOne({ userName: username });
    if (user) {
      user.profileCompleted = true;
      await user.save();
      console.log("✅ User profileCompleted updated to true");
    } else {
      console.warn("⚠️ User not found for username:", username);
    }

    res.status(201).json({
      message: "Profile submitted successfully",
      profileCompleted: true,
    });
  } catch (error) {
    console.error("❌ Profile creation error:", error);
    next(error);
  }
});

export const viewProfile = TryCatch(async (req, res, next) => {
  const username = req.user.userName;
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

export const allservicesprofile = TryCatch(async (req, res, next) => {
  const username = req.query.username; // Get username from query parameters
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

    res.status(200).json({
      name: userProfile.name,
      profileImage: userProfile.profileImage,
    });
  } catch (error) {
    next(error);
  }
});

// Delete Profile - NEW FUNCTION
export const deleteProfile = TryCatch(async (req, res, next) => {
  // ✅ Use authenticated username - NO SENSITIVE DATA IN URL
  const username = req.user.userName;

  try {
    // Find existing profile using authenticated username
    const existingProfile = await SkillForm.findOne({ username });
    if (!existingProfile) {
      return res.status(404).json({
        message: "Profile not found for this user",
      });
    }

    // Delete profile image from Cloudinary if it exists
    if (existingProfile.profileImage) {
      await deleteImageFromCloudinary(existingProfile.profileImage);
    }

    // Delete profile from database
    await SkillForm.findOneAndDelete({ username });

    res.status(200).json({
      message: "Profile deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

// Update Profile - NEW FUNCTION
export const updateProfile = TryCatch(async (req, res, next) => {
  const { name, city, country, contactNumber, bio, skills, profileImage } =
    req.body;

  // ✅ Use authenticated username - NO SENSITIVE DATA IN URL
  const username = req.user.userName;

  // Validation
  if (
    !name ||
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

  // Input validation
  if (name.length > 100 || city.length > 50 || bio.length > 1000) {
    return res.status(400).json({
      message: "Input data exceeds maximum allowed length",
    });
  }

  if (skills.length > 20 || skills.some((skill) => skill.length > 50)) {
    return res.status(400).json({
      message: "Too many skills or skill name too long",
    });
  }

  try {
    // Find existing profile using authenticated username
    const existingProfile = await SkillForm.findOne({ username });
    if (!existingProfile) {
      return res.status(404).json({
        message: "Profile not found for this user",
      });
    }

    let updatedImageUrl = profileImage || "";

    // Handle image update if new image is provided
    if (profileImage && profileImage !== existingProfile.profileImage) {
      if (profileImage.startsWith("data:image")) {
        // Upload new image to Cloudinary
        updatedImageUrl = await uploadImageToCloudinary(profileImage);

        // Delete old image after successful upload
        if (existingProfile.profileImage) {
          await deleteImageFromCloudinary(existingProfile.profileImage);
        }
      }
      // If profileImage is empty string, it means user wants to remove image
      else if (profileImage === "" && existingProfile.profileImage) {
        await deleteImageFromCloudinary(existingProfile.profileImage);
        updatedImageUrl = "";
      }
    }

    // Update profile with sanitized data
    const updatedProfile = await SkillForm.findOneAndUpdate(
      { username },
      {
        name: name.trim(),
        city: city.trim(),
        country: country || "Pakistan",
        contactNumber: contactNumber.trim(),
        bio: bio.trim(),
        profileImage: updatedImageUrl,
        skills: skills
          .map((skill) => skill.trim())
          .filter((skill) => skill.length > 0),
        updatedAt: new Date(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      message: "Profile updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to extract public_id from cloudinary URL
const extractPublicId = (imageUrl) => {
  if (!imageUrl || !imageUrl.includes("cloudinary")) return null;

  const parts = imageUrl.split("/");
  const uploadIndex = parts.findIndex((part) => part === "upload");
  if (uploadIndex === -1) return null;

  const publicIdPart = parts.slice(uploadIndex + 2).join("/");
  return publicIdPart.split(".")[0]; // Remove file extension
};

// Helper function to upload image to Cloudinary
const uploadImageToCloudinary = async (base64Image) => {
  try {
    const uploadResult = await cloudinary.uploader.upload(base64Image, {
      folder: "profile_images",
      resource_type: "image",
      transformation: [
        { width: 500, height: 500, crop: "fill" },
        { quality: "auto" },
        { format: "auto" },
      ],
    });
    return uploadResult.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Image upload failed");
  }
};

// Helper function to delete image from Cloudinary
const deleteImageFromCloudinary = async (imageUrl) => {
  const publicId = extractPublicId(imageUrl);
  if (publicId) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error("Error deleting image from Cloudinary:", error);
      // Don't throw error, continue with profile operations
    }
  }
};
