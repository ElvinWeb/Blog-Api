import { AuthController } from "@/controllers/auth.controller";
import authenticate from "@/middlewares/Authenticate.middleware";
import validationError from "@/middlewares/ValidationError.middleware";
import { AuthService } from "@/services/auth.service";
import {
  validateLogin,
  validateRefreshToken,
  validateRegister,
} from "@/validators/auth.validator";
import { Router } from "express";

const router = Router();
const authService = new AuthService();
const { login, register, refreshToken, logout } = new AuthController(authService);

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
