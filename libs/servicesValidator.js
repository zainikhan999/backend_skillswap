import { body } from "express-validator";

export const servicesValidator = [
  body("skillName", "Skill name is required").notEmpty(),
  body("skillDescription", "Skill description is required").notEmpty(),
  // body("swapscount", "Swaps count is required").notEmpty(),
  body("exchangeService", "Exchange service is required").notEmpty(),
  body("username", "Username is required").notEmpty(),
];
