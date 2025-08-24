import authenticate from "@/middlewares/authenticate";
import authorize from "@/middlewares/authorize";
import { Router } from "express";

const router = Router();

router.get("/current", authenticate, authorize(["admin", "user"]));

export { router as userRoutes };
