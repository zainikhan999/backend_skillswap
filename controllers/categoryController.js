import { GoogleGenAI } from "@google/genai";
import axios from "axios";
import Category from "../Model/Category.js"; // Import the Category model
import dotenv from "dotenv";

dotenv.config();

// Set up Google Gemini API instance
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const fetchCategoriesFromDB = async () => {
  const categories = await Category.find({});
  return categories.map((cat) => cat.name);
};

// Function to check and store new category in MongoDB
const addNewCategoryToDatabase = async (category) => {
  try {
    // Check if the category already exists in the database
    const existingCategory = await Category.findOne({ name: category });

    // If the category does not exist, add it to the database
    if (!existingCategory) {
      const newCategory = new Category({ name: category });
      await newCategory.save();
      console.log(`Category "${category}" added to database.`);
    } else {
      console.log(`Category "${category}" already exists in the database.`);
    }
  } catch (error) {
    console.error("Database Error:", error.message);
  }
};

export const classifyText = async (req, res) => {
  const { text } = req.body;

  try {
    const CATEGORIES = await fetchCategoriesFromDB(); // Example: ["Fitness", "Education", "Marketing"]
    const categorySet = new Set(CATEGORIES.map((c) => c.toLowerCase())); // Lowercase for match

    // Construct prompt with existing categories
    const prompt = `
You are an expert classifier. Classify the given service description into ONE category from this list ONLY: [${CATEGORIES.join(
      ", "
    )}].

- Choose the most relevant existing category from the list.
- If none fits, suggest ONE NEW broad category (e.g., "Design", "Technology", "Food") but NOT unrelated categories.
- ONLY output the category name exactly as in the list or a new suitable broad category.
- NO explanations or extra text.

Examples:
- "I will help you with cooking recipes" → Food
- "Math tutoring for high school students" → Education
- "Yoga classes" → Fitness

Service Description: "${text}"
`;

    // Ask Gemini
    const geminiResponse = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const rawCategory =
      geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "Miscellaneous";

    const formattedCategory = rawCategory
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());

    // Check if the returned category exists in DB
    if (!categorySet.has(formattedCategory.toLowerCase())) {
      await addNewCategoryToDatabase(formattedCategory);
    }

    console.log(`Final category: ${formattedCategory}`);

    res.json({
      category: formattedCategory,
    });
  } catch (error) {
    console.error("Classification Error:", error.message);
    res.status(500).json({
      category: "Error",
      details: error.message,
    });
  }
};
