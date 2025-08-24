import { login, logout, refreshToken, register } from "@/controllers/auth.controller";
import authenticate from "@/middlewares/authenticate";
import validationError from "@/middlewares/validationError";
import {
  validateLogin,
  validateRefreshToken,
  validateRegister,
} from "@/validators/auth.validator";
import { Router } from "express";

const router = Router();

router.post("/register", validateRegister, validationError, register);

router.post("/login", validateLogin, validationError, login);

router.post(
  "/refresh-token",
  validateRefreshToken,
  validationError,
  refreshToken,
);

router.post("/logout", authenticate, logout);

export { router as authRoutes };

