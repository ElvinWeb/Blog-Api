import { Router } from "express";
import { authRoutes } from "@/routes/auth.route";
import { userRoutes } from "@/routes/user.route";

const router = Router();

router.get("/", (_, res) => {
  res.status(200).json({
    message: "API is live!",
    status: "ok✅",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);

export default router;
