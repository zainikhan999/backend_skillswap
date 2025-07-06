import { envMode } from "../app.js"; // Ensure you are importing your environment mode correctly
import winston from "winston";

const logger = winston.createLogger({
  level: "error",
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "error.log" }), // Log to a file
  ],
});

// Error Middleware
const errorMiddleware = (err, req, res, next) => {
  // Set default error message and status code
  err.message ||= "Internal Server Error"; // Default error message
  err.statusCode ||= 500; // Default status code

  // Handle MongoDB duplicate key error
  if (err.code === 11000) {
    const error = Object.keys(err.keyPattern).join(",");
    err.message = `Duplicate field - ${error}`; // Duplicate entry message
    err.statusCode = 400; // Bad request status code
  }

  // Handle MongoDB CastError (invalid ObjectId format)
  if (err.name === "CastError") {
    const errorPath = err.path;
    err.message = `Invalid Format of ${errorPath}`; // Invalid ID format message
    err.statusCode = 400; // Bad request status code
  }

  // Handle validation errors (for example, from Mongoose schema validation)
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((val) => val.message); // Get error messages
    err.message = `Validation failed: ${errors.join(", ")}`; // Return a combined message
    err.statusCode = 400; // Bad request status code
  }

  // Prepare the response object
  const response = {
    success: false,
    message: err.message,
    timestamp: new Date().toISOString(), // Add timestamp for debugging
  };

  // Only send detailed error information if we're in development mode
  if (envMode === "DEVELOPMENT") {
    response.error = err; // Include the entire error object for debugging
  }

  // Log the error for internal monitoring (e.g., to a file or external service)
  logger.error(err.message, { stack: err.stack });

  // Send the error response
  return res.status(err.statusCode).json(response);
};

// Try-Catch wrapper for async functions
const TryCatch = (passedFunc) => async (req, res, next) => {
  try {
    await passedFunc(req, res, next); // Execute the passed function
  } catch (error) {
    next(error); // Pass any error to the error handling middleware
  }
};

export { errorMiddleware, TryCatch };
