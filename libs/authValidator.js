import { body } from "express-validator";
import { validationResult } from "express-validator";
import { ErrorHandler } from "../utils/utility.js";
export const validationHandler = (req, res, next) => {
  const errors = validationResult(req);

  const errorMessages = errors
    .array()
    .map((error) => error.msg)
    .join(", ");

  if (errors.isEmpty()) return next();
  else next(new ErrorHandler(errorMessages, 400));
};
export const signupValidator = [
  body("userName", "Username is required").notEmpty(),
  body("firstName", "First name is required").notEmpty(),
  body("lastName", "Last name is required").notEmpty(),
  body("email", "Email is required").isEmail(),
  body("password", "Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
];

export const loginValidator = [
  body("userName", "Username is required").notEmpty(),
  body("password", "Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
];
