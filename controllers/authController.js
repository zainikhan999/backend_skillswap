import bcrypt from "bcrypt";
import skillswapuser from "../Model/User.js";
import { TryCatch } from "../middleware/error.js"; // Import the TryCatch utility

// Signup Controller
export const signup = TryCatch(async (req, res, next) => {
  const { userName, firstName, lastName, email, password } = req.body;

  // Validate required fields
  if (!userName || !firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Normalize input to lowercase
  const lowerCaseUserName = userName.toLowerCase();
  const lowerCaseEmail = email.toLowerCase();

  try {
    // Check if the username or email already exists in the database
    const existingUser = await skillswapuser.findOne({
      $or: [{ userName: lowerCaseUserName }, { email: lowerCaseEmail }],
    });

    if (existingUser) {
      const conflictField =
        existingUser.userName === lowerCaseUserName ? "Username" : "Email";
      return res
        .status(400)
        .json({ message: `${conflictField} already exists` });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user record
    const newUser = new skillswapuser({
      userName: lowerCaseUserName,
      firstName,
      lastName,
      email: lowerCaseEmail,
      password: hashedPassword,
    });

    // Save the new user to the database
    const result = await newUser.save();

    // Respond with a success message and user ID
    res.status(201).json({
      message: "User registered successfully",
      userId: result._id,
    });
  } catch (error) {
    console.error("Error saving user data:", error);
    // Call next to forward the error to the error-handling middleware
    next(error);
  }
});

export const login = TryCatch(async (req, res, next) => {
  const { userName, password } = req.body;

  console.log(`Login attempt for username: ${userName}`);

  try {
    const user = await skillswapuser.findOne({
      userName: userName.toLowerCase(),
    });

    if (user) {
      console.log("User found:", user);

      // Compare the entered password with the stored hashed password
      const passwordMatch = await bcrypt.compare(password, user.password);
      console.log("Password match:", passwordMatch);

      if (passwordMatch) {
        console.log("User login successful");
        return res
          .status(200)
          .json({ message: "User login successful", userType: "user" });
      } else {
        console.log("Invalid password");
        return res
          .status(401)
          .json({ message: "Invalid username or password" });
      }
    }

    // If the user is not found
    console.log("User not found");
    return res.status(401).json({ message: "Invalid username or password" });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Server error" });
  }
});
