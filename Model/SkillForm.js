import mongoose from "mongoose";

const SkillFormSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  city: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    default: "Pakistan",
    immutable: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
    required: true,
  },
  skills: {
    type: [String],
    required: true,
  },
  profileImage: {
    type: String,
  },
});

const SkillForm = mongoose.model("SkillForm", SkillFormSchema);

export default SkillForm;
