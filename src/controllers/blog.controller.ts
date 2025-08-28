import { HttpStatusCodes } from "@/constants/api.constants";
import * as blogService from "@/services/blog.service";
import { TBlogData } from "@/types/blog.types";
import { handleError } from "@/utils";
import type { Request, Response } from "express";

export const createBlog = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const blogData = req.body as TBlogData;
    const userId = req.userId;

    const blog = await blogService.createBlog(userId, blogData);

    res.status(HttpStatusCodes.CREATED).json({
      blog,
    });
  } catch (err) {
    handleError(res, err);
  }
};

export const deleteBlog = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId;
    const blogId = req.params.blogId;

    await blogService.deleteBlog(userId, blogId);

    res.sendStatus(HttpStatusCodes.NO_CONTENT);
  } catch (err) {
    handleError(res, err);
  }
};

export const updateBlog = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId;
    const blogId = req.params.blogId;
    const updateData = req.body as TBlogData;

    const blog = await blogService.updateBlog(userId, blogId, updateData);

    res.status(HttpStatusCodes.OK).json({
      blog,
    });
  } catch (err) {
    handleError(res, err);
  }
};

export const getAllBlogs = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId;
    const limit = parseInt(req.query.limit as string);
    const offset = parseInt(req.query.offset as string);

    const result = await blogService.getAllBlogs(userId, limit, offset);

    res.status(HttpStatusCodes.OK).json(result);
  } catch (err) {
    handleError(res, err);
  }
};

export const getBlogBySlug = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId;
    const slug = req.params.slug;

    const blog = await blogService.getBlogBySlug(userId, slug);

    res.status(HttpStatusCodes.OK).json({
      blog,
    });
  } catch (err) {
    handleError(res, err);
  }
};

export const getBlogsByUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const currentUserId = req.userId;
    const targetUserId = req.params.userId;
    const limit = parseInt(req.query.limit as string);
    const offset = parseInt(req.query.offset as string);

    const result = await blogService.getBlogsByUser(
      currentUserId,
      targetUserId,
      limit,
      offset,
    );

    res.status(HttpStatusCodes.OK).json(result);
  } catch (err) {
    handleError(res, err);
  }
};
