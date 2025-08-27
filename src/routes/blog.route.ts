import {
  createBlog,
  deleteBlog,
  getAllBlogs,
  getBlogBySlug,
  getBlogsByUser,
  updateBlog,
} from "@/controllers/blog.controller";
import authenticate from "@/middlewares/authenticate";
import authorize from "@/middlewares/authorize";
import uploadBlogBanner from "@/middlewares/uploadBlogBanner";
import validationError from "@/middlewares/validationError";
import {
  validateBlogId,
  validateBlogSlug,
  validateCreateBlog,
  validateGetAllBlogs,
  validateGetBlogsByUser,
  validateUpdateBlog,
} from "@/validators/blog.validator";
import { Router } from "express";
import multer from "multer";

const router = Router();
const upload = multer();

router.post(
  "/",
  authenticate,
  authorize(["admin"]),
  upload.single("banner_image"),
  validateCreateBlog,
  validationError,
  uploadBlogBanner("post"),
  createBlog,
);

router.get(
  "/",
  authenticate,
  authorize(["admin", "user"]),
  validateGetAllBlogs,
  validationError,
  getAllBlogs,
);

router.get(
  "/user/:userId",
  authenticate,
  authorize(["admin", "user"]),
  validateGetBlogsByUser,
  validationError,
  getBlogsByUser,
);

router.get(
  "/:slug",
  authenticate,
  authorize(["admin", "user"]),
  validateBlogSlug,
  validationError,
  getBlogBySlug,
);

router.put(
  "/:blogId",
  authenticate,
  authorize(["admin"]),
  validateBlogId,
  upload.single("banner_image"),
  validateUpdateBlog,
  validationError,
  uploadBlogBanner("put"),
  updateBlog,
);

router.delete("/:blogId", authenticate, authorize(["admin"]), deleteBlog);

export { router as blogRoutes };
