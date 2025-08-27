import { MAX_FILE_SIZE } from "@/constants/app.constants";
import uploadToCloudinary from "@/libs/cloudinary";
import { logger } from "@/libs/winston";
import Blog from "@/models/blog.model";
import { TBlogUploadMethod } from "@/types/blog.types";
import type { UploadApiErrorResponse } from "cloudinary";
import type { NextFunction, Request, Response } from "express";

const uploadBlogBanner = (method: TBlogUploadMethod) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (method === "put" && !req.file) {
      next();
      return;
    }

    if (!req.file) {
      res.status(400).json({
        code: "ValidationError",
        message: "Blog banner is required",
      });
      return;
    }

    if (req.file.size > MAX_FILE_SIZE) {
      res.status(413).json({
        code: "ValidationError",
        message: "File size must be less than 2MB",
      });
      return;
    }

    try {
      const { blogId } = req.params;
      const blog = await Blog.findById(blogId).select("banner.publicId").exec();

      const data = await uploadToCloudinary(
        req.file.buffer,
        blog?.banner.publicId.replace("blog-api/", ""),
      );

      if (!data) {
        res.status(500).json({
          code: "ServerError",
          message: "Internal server error",
        });

        logger.error("Error while uploading blog banner to cloudinary", {
          blogId,
          publicId: blog?.banner.publicId,
        });
        return;
      }

      const newBanner = {
        publicId: data.public_id,
        url: data.secure_url,
        width: data.width,
        height: data.height,
      };

      logger.info("Blog banner uploaded to Cloudinary", {
        blogId,
        banner: newBanner,
      });

      req.body.banner = newBanner;

      next();
    } catch (err: UploadApiErrorResponse | any) {
      res.status(err.http_code).json({
        code: err.http_code < 500 ? "ValidationError" : err.name,
        message: err.message,
      });

      logger.error("Error while uploading blog banner to Cloudinary", err);
    }
  };
};

export default uploadBlogBanner;
