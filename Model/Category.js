import mongoose from "mongoose";

// Define the category schema
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Ensure the category name is unique
  },
});

// Create the Category model
const Category = mongoose.model("Category", categorySchema);

export default Category;
