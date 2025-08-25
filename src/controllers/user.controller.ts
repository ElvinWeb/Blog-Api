import {
  DEFAULT_RES_LIMIT,
  DEFAULT_RES_OFFSET,
} from "@/constants/response.constants";
import { logger } from "@/lib/winston";
import Blog from "@/models/blog.model";
import User from "@/models/user.model";
import type { Request, Response } from "express";

export const getCurrentUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).select("-__v").lean().exec();

    res.status(200).json({
      user,
    });
  } catch (err) {
    res.status(500).json({
      code: "ServerError",
      message: "Internal server error",
      error: err,
    });

    logger.error("Error while getting current user", err);
  }
};

export const updateCurrentUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.userId;
  const {
    username,
    email,
    password,
    first_name,
    last_name,
    website,
    facebook,
    instagram,
    linkedin,
    x,
    youtube,
  } = req.body;

  try {
    const user = await User.findById(userId).select("+password -__v").exec();

    if (!user) {
      res.status(404).json({
        code: "NotFound",
        message: "User not found",
      });
      return;
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (password) user.password = password;
    if (first_name) user.firstName = first_name;
    if (last_name) user.lastName = last_name;
    if (!user.socialLinks) {
      user.socialLinks = {};
    }
    if (website) user.socialLinks.website = website;
    if (facebook) user.socialLinks.facebook = facebook;
    if (instagram) user.socialLinks.instagram = instagram;
    if (linkedin) user.socialLinks.linkedin = linkedin;
    if (x) user.socialLinks.x = x;
    if (youtube) user.socialLinks.youtube = youtube;

    await user.save();
    logger.info("User update successfully", user);

    res.status(200).json({
      user,
    });
  } catch (err) {
    res.status(500).json({
      code: "ServerError",
      message: "Internal server error",
      error: err,
    });

    logger.error("Error while updating current user", err);
  }
};

export const deleteCurrentUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.userId;

  try {
    const blogs = await Blog.find({ author: userId })
      .select("banner.publicId")
      .lean()
      .exec();
    const publicIds = blogs.map(({ banner }) => banner.publicId);

    logger.info("Multiple blog banners deleted from Cloudinary", {
      publicIds,
    });

    await Blog.deleteMany({ author: userId });
    logger.info("Multiple blogs deleted", {
      userId,
      blogs,
    });

    await User.deleteOne({ _id: userId });
    logger.info("A user account has been deleted", {
      userId,
    });

    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({
      code: "ServerError",
      message: "Internal server error",
      error: err,
    });

    logger.error("Error while deleting current user account", err);
  }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId).select("-__v").exec();

    if (!user) {
      res.status(404).json({
        code: "NotFound",
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      user,
    });
  } catch (err) {
    res.status(500).json({
      code: "ServerError",
      message: "Internal server error",
      error: err,
    });

    logger.error("Error while getting a user", err);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.params.userId;

  try {
    const blogs = await Blog.find({ author: userId })
      .select("banner.publicId")
      .lean()
      .exec();
    const publicIds = blogs.map(({ banner }) => banner.publicId);

    logger.info("Multiple blog banners deleted from Cloudinary", {
      publicIds,
    });

    await Blog.deleteMany({ author: userId });
    logger.info("Multiple blogs deleted", {
      userId,
      blogs,
    });

    await User.deleteOne({ _id: userId });
    logger.info("A user account has been deleted", {
      userId,
    });

    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({
      code: "ServerError",
      message: "Internal server error",
      error: err,
    });

    logger.error("Error while deleting current user account", err);
  }
};

export const getAllUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || DEFAULT_RES_LIMIT;
    const offset = parseInt(req.query.offset as string) || DEFAULT_RES_OFFSET;
    const total = await User.countDocuments();

    const users = await User.find()
      .select("-__v")
      .limit(limit)
      .skip(offset)
      .lean()
      .exec();

    res.status(200).json({
      limit,
      offset,
      total,
      users,
    });
  } catch (err) {
    res.status(500).json({
      code: "ServerError",
      message: "Internal server error",
      error: err,
    });

    logger.error("Error while getting all users", err);
  }
};
