import mongoose from "mongoose";

const ServicesSchema = new mongoose.Schema({
  skillName: {
    type: String,
    required: true,
  },
  skillDescription: {
    type: String,
    required: true,
    minlength: [10, "Description must be at least 10 characters long"],
  },

  exchangeService: {
    type: String, // Service user wants in exchange
    required: true,
  },
  username: {
    type: String, // Store the username here
    required: true,
  },

  category: {
    type: String,
    required: true,
  },
});

const Services = mongoose.model("Services", ServicesSchema);

export default Services;
