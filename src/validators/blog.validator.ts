import { body, param, query } from "express-validator";

export const validateCreateBlog = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 180 })
    .withMessage("Title must be less than 180 characters"),
  body("content").trim().notEmpty().withMessage("Content is required"),
  body("status")
    .optional()
    .isIn(["draft", "published"])
    .withMessage("Status must be one of the value, draft or published"),
];

export const validateGetAllBlogs = [
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 to 50"),
  query("offset")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Offset must be a positive integer"),
];

export const validateGetBlogsByUser = [
  param("userId").isMongoId().withMessage("Invalid user ID"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 to 50"),
  query("offset")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Offset must be a positive integer"),
];

export const validateUpdateBlog = [
  body("title")
    .optional()
    .isLength({ max: 180 })
    .withMessage("Title must be less than 180 characters"),
  body("content"),
  body("status")
    .optional()
    .isIn(["draft", "published"])
    .withMessage("Status must be one of the value, draft or published"),
];

export const validateBlogId = [
  param("blogId").isMongoId().withMessage("Invalid blog ID"),
];

export const validateBlogSlug = [
  param("slug").notEmpty().withMessage("Slug is required"),
];
