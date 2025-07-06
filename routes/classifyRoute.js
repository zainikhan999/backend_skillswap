import express from "express";
import { classifyText } from "../controllers/categoryController.js";

const app = express.Router();

app.post("/classify", classifyText);

export default app;
