import { HttpStatusCodes } from "@/constants/api.constants";
import {
  DEFAULT_RES_LIMIT,
  DEFAULT_RES_OFFSET,
} from "@/constants/response.constants";
import { logger } from "@/lib/winston";
import Blog from "@/models/blog.model";
import User from "@/models/user.model";
import { TUserId } from "@/types/user.types";
import { handleError } from "@/utils/error";
import type { Request, Response } from "express";

export const getCurrentUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).select("-__v").lean().exec();

    if (!user) {
      res.status(HttpStatusCodes.NOT_FOUND).json({
        code: "NotFound",
        message: "User not found",
      });
      return;
    }

    res.status(HttpStatusCodes.OK).json({
      user,
    });
  } catch (err) {
    handleError(res, err);
  }
};

export const updateCurrentUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
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

    const user = await User.findById(userId).select("+password -__v").exec();

    if (!user) {
      res.status(HttpStatusCodes.NOT_FOUND).json({
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
    logger.info("User updated successfully", { userId: user._id });

    res.status(HttpStatusCodes.OK).json({
      user,
    });
  } catch (err) {
    handleError(res, err);
  }
};

export const deleteCurrentUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId;

    await cleanupUserData(userId);

    res.sendStatus(HttpStatusCodes.NO_CONTENT);
  } catch (err) {
    handleError(res, err);
  }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId).select("-__v").lean().exec();

    if (!user) {
      res.status(HttpStatusCodes.NOT_FOUND).json({
        code: "NotFound",
        message: "User not found",
      });
      return;
    }

    res.status(HttpStatusCodes.OK).json({
      user,
    });
  } catch (err) {
    handleError(res, err);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.params.userId;

    const userExists = await User.exists({ _id: userId });
    if (!userExists) {
      res.status(HttpStatusCodes.NOT_FOUND).json({
        code: "NotFound",
        message: "User not found",
      });
      return;
    }

    await cleanupUserData(userId);

    res.sendStatus(HttpStatusCodes.NO_CONTENT);
  } catch (err) {
    handleError(res, err);
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

    res.status(HttpStatusCodes.OK).json({
      limit,
      offset,
      total,
      users,
    });
  } catch (err) {
    handleError(res, err);
  }
};

const cleanupUserData = async (userId: TUserId): Promise<void> => {
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
};
