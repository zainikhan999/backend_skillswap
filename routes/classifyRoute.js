import express from "express";
import { classifyText } from "../controllers/categoryController.js";
import { protect } from "../middleware/auth.js"; // Import the auth middleware

const app = express.Router();

app.post("/classify", protect, classifyText);

export default app;
