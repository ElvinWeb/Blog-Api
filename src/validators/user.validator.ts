import User from "@/models/user.model";
import { body, param, query } from "express-validator";

export const validateUpdateCurrentUser = [
  body("username")
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage("Username must be less than 20 characters")
    .custom(async (value) => {
      const userExists = await User.exists({ username: value });

      if (userExists) {
        throw Error("This username is already in use");
      }
    }),
  body("email")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Email must be less than 50 characters")
    .isEmail()
    .withMessage("Invalid email address")
    .custom(async (value) => {
      const userExists = await User.exists({ email: value });

      if (userExists) {
        throw Error("This email is already in use");
      }
    }),
  body("password")
    .optional()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  body("first_name")
    .optional()
    .isLength({ max: 20 })
    .withMessage("First name must be less than 20 characters"),
  body("last_name")
    .optional()
    .isLength({ max: 20 })
    .withMessage("Last name must be less than 20 characters"),
  body(["website", "facebook", "instagram", "linkedin", "x", "youtube"])
    .optional()
    .isURL()
    .withMessage("Invalid URL")
    .isLength({ max: 100 })
    .withMessage("Url must be less than 100 characters"),
];

export const validateGetAllUsers = [
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 to 50"),
  query("offset")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Offset must be a positive integer"),
];

export const validateUserId = [
  param("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .isMongoId()
    .withMessage("Invalid user ID format"),
];
