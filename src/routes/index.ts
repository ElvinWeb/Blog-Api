import { Router } from "express";
import { authRoutes } from "./auth.route";
import { blogRoutes } from "./blog.route";
import { userRoutes } from "./user.route";

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
router.use("/blogs", blogRoutes);

export default router;
