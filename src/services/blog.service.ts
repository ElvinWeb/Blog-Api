import { v2 as cloudinary } from "cloudinary";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import { HttpStatusCodes } from "../constants/api.constants";
import {
  DEFAULT_RES_LIMIT,
  DEFAULT_RES_OFFSET,
} from "../constants/response.constants";
import { logger } from "../libs/winston";
import Blog from "../models/blog.model";
import User from "../models/user.model";
import {
  BlogError,
  IBlog,
  IBlogListResponse,
  IQueryStatus,
  TBlogData,
} from "../types/blog.types";
import { TUserId } from "../types/user.types";

const window = new JSDOM("").window;
const purify = DOMPurify(window);

export const createBlog = async (
  userId: TUserId,
  blogData: TBlogData,
): Promise<IBlog> => {
  const { title, content, banner, status } = blogData;

  const cleanContent = purify.sanitize(content);

  const newBlog = await Blog.create({
    title,
    content: cleanContent,
    banner,
    status,
    author: userId,
  });

  logger.info("New blog created", { blogId: newBlog._id, userId });
  return newBlog;
};

export const deleteBlog = async (
  userId: TUserId,
  blogId: string,
): Promise<void> => {
  const user = await User.findById(userId).select("role").lean().exec();
  const blog = await Blog.findById(blogId)
    .select("author banner.publicId")
    .lean()
    .exec();

  if (!blog) {
    throw new BlogError(
      "Blog not found",
      HttpStatusCodes.NOT_FOUND,
      "NotFound",
    );
  }

  if (blog.author !== userId && user?.role !== "admin") {
    logger.warn("User tried to delete blog without permission", {
      userId,
      blogId,
      blogAuthor: blog.author,
    });
    throw new BlogError(
      "Access denied, insufficient permissions",
      HttpStatusCodes.FORBIDDEN,
      "AuthorizationError",
    );
  }

  if (blog.banner?.publicId) {
    await cloudinary.uploader.destroy(blog.banner.publicId);
    logger.info("Blog banner deleted from Cloudinary", {
      publicId: blog.banner.publicId,
    });
  }

  await Blog.deleteOne({ _id: blogId });
  logger.info("Blog deleted successfully", { blogId, userId });
};

export const updateBlog = async (
  userId: TUserId,
  blogId: string,
  updateData: Partial<TBlogData>,
): Promise<IBlog> => {
  const { title, content, banner, status } = updateData;

  const user = await User.findById(userId).select("role").lean().exec();
  const blog = await Blog.findById(blogId).select("-__v").exec();

  if (!blog) {
    throw new BlogError(
      "Blog not found",
      HttpStatusCodes.NOT_FOUND,
      "NotFound",
    );
  }

  if (blog.author !== userId && user?.role !== "admin") {
    logger.warn("User tried to update blog without permission", {
      userId,
      blogId,
      blogAuthor: blog.author,
    });
    throw new BlogError(
      "Access denied, insufficient permissions",
      HttpStatusCodes.FORBIDDEN,
      "AuthorizationError",
    );
  }

  if (title) blog.title = title;
  if (content) {
    const cleanContent = purify.sanitize(content);
    blog.content = cleanContent;
  }
  if (banner) blog.banner = banner;
  if (status) blog.status = status;

  await blog.save();
  logger.info("Blog updated successfully", { blogId, userId });

  return blog;
};

export const getAllBlogs = async (
  userId: TUserId,
  limit?: number,
  offset?: number,
): Promise<IBlogListResponse> => {
  const resolvedLimit = limit || DEFAULT_RES_LIMIT;
  const resolvedOffset = offset || DEFAULT_RES_OFFSET;

  const user = await User.findById(userId).select("role").lean().exec();
  const query: IQueryStatus = {};

  if (user?.role === "user") {
    query.status = "published";
  }

  const total = await Blog.countDocuments(query);
  const blogs = await Blog.find(query)
    .select("-banner.publicId -__v")
    .populate("author", "-createdAt -updatedAt -__v")
    .limit(resolvedLimit)
    .skip(resolvedOffset)
    .sort({ createdAt: -1 })
    .lean()
    .exec();

  logger.info("Blogs retrieved successfully", {
    userId,
    limit: resolvedLimit,
    offset: resolvedOffset,
    total,
    count: blogs.length,
  });

  return {
    limit: resolvedLimit,
    offset: resolvedOffset,
    total,
    blogs,
  };
};

export const getBlogBySlug = async (
  userId: TUserId,
  slug: string,
): Promise<IBlog> => {
  const user = await User.findById(userId).select("role").lean().exec();
  const blog = await Blog.findOne({ slug })
    .select("-banner.publicId -__v")
    .populate("author", "-createdAt -updatedAt -__v")
    .lean()
    .exec();

  if (!blog) {
    throw new BlogError(
      "Blog not found",
      HttpStatusCodes.NOT_FOUND,
      "NotFound",
    );
  }

  if (user?.role === "user" && blog.status === "draft") {
    logger.warn("User tried to access draft blog", {
      userId,
      blogId: blog._id,
      slug,
    });
    throw new BlogError(
      "Access denied, insufficient permissions",
      HttpStatusCodes.FORBIDDEN,
      "AuthorizationError",
    );
  }

  logger.info("Blog retrieved by slug", { userId, slug });

  return blog;
};

export const getBlogsByUser = async (
  currentUserId: TUserId,
  targetUserId: string,
  limit?: number,
  offset?: number,
): Promise<IBlogListResponse> => {
  const resolvedLimit = limit || DEFAULT_RES_LIMIT;
  const resolvedOffset = offset || DEFAULT_RES_OFFSET;

  const currentUser = await User.findById(currentUserId)
    .select("role")
    .lean()
    .exec();

  const query: IQueryStatus = {};

  if (currentUser?.role === "user") {
    query.status = "published";
  }

  const total = await Blog.countDocuments({ author: targetUserId, ...query });
  const blogs = await Blog.find({ author: targetUserId, ...query })
    .select("-banner.publicId -__v")
    .populate("author", "-createdAt -updatedAt -__v")
    .limit(resolvedLimit)
    .skip(resolvedOffset)
    .sort({ createdAt: -1 })
    .lean()
    .exec();

  logger.info("User blogs retrieved successfully", {
    currentUserId,
    targetUserId,
    limit: resolvedLimit,
    offset: resolvedOffset,
    total,
    count: blogs.length,
  });

  return {
    limit: resolvedLimit,
    offset: resolvedOffset,
    total,
    blogs,
  };
};
