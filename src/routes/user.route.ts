import {
  deleteCurrentUser,
  deleteUser,
  getAllUser,
  getCurrentUser,
  getUser,
  updateCurrentUser,
} from "@/controllers/user.controller";
import authenticate from "@/middlewares/authenticate";
import authorize from "@/middlewares/authorize";
import validationError from "@/middlewares/validationError";
import {
  validateGetAllUsers,
  validateUpdateCurrentUser,
  validateUserId,
} from "@/validators/user.validator";
import { Router } from "express";

const router = Router();

router.get(
  "/current",
  authenticate,
  authorize(["admin", "user"]),
  getCurrentUser,
);

router.put(
  "/current",
  authenticate,
  authorize(["admin", "user"]),
  validateUpdateCurrentUser,
  validationError,
  updateCurrentUser,
);

router.delete(
  "/current",
  authenticate,
  authorize(["admin", "user"]),
  deleteCurrentUser,
);

router.get(
  "/",
  authenticate,
  authorize(["admin"]),
  validateGetAllUsers,
  validationError,
  getAllUser,
);

router.get(
  "/:userId",
  authenticate,
  authorize(["admin"]),
  validateUserId,
  validationError,
  getUser,
);

router.delete(
  "/:userId",
  authenticate,
  authorize(["admin"]),
  validateUserId,
  validationError,
  deleteUser,
);

export { router as userRoutes };
