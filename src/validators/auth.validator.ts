import User from "@/models/User.model";
import { body, cookie } from "express-validator";
import bcrypt from "bcrypt";
import {
  MAX_EMAIL_LENGTH,
  MIN_PASSWORD_LENGTH,
} from "@/constants/user.constants";

export const validateRegister = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isLength({ max: MAX_EMAIL_LENGTH })
    .withMessage("Email must be less than 50 characters")
    .isEmail()
    .withMessage("Invalid email address")
    .custom(async (value) => {
      const userExists = await User.exists({ email: value });
      if (userExists) {
        throw new Error("User email or password is invalid");
      }
    }),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: MIN_PASSWORD_LENGTH })
    .withMessage("Password must be at least 8 characters long"),

  body("role")
    .optional()
    .isString()
    .withMessage("Role must be a string")
    .isIn(["admin", "user"])
    .withMessage("Role must be either admin or user"),
];

export const validateLogin = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isLength({ max: MAX_EMAIL_LENGTH })
    .withMessage("Email must be less than 50 characters")
    .isEmail()
    .withMessage("Invalid email address")
    .custom(async (value) => {
      const userExists = await User.exists({ email: value });
      if (!userExists) {
        throw new Error("User email or password is invalid");
      }
    }),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: MIN_PASSWORD_LENGTH })
    .withMessage("Password must be at least 8 characters long")
    .custom(async (value, { req }) => {
      const { email } = req.body as { email: string };
      const user = await User.findOne({ email })
        .select("password")
        .lean()
        .exec();

      if (!user) {
        throw new Error("User email or password is invalid");
      }

      const passwordMatch = await bcrypt.compare(value, user.password);

      if (!passwordMatch) {
        throw new Error("User email or password is invalid");
      }
    }),
];

export const validateRefreshToken = [
  cookie("refreshToken")
    .notEmpty()
    .withMessage("Refresh token required")
    .isJWT()
    .withMessage("Invalid refresh token"),
];
