import { HttpStatusCodes } from "@/constants/api.constants";
import {
  DEFAULT_RES_LIMIT,
  DEFAULT_RES_OFFSET,
} from "@/constants/response.constants";
import { logger } from "@/libs/winston";
import Blog from "@/models/blog.model";
import User from "@/models/user.model";
import {
  IUpdateUserData,
  IUser,
  UserError,
  IUserListResponse,
  TUserId,
} from "@/types/user.types";
import { v2 as cloudinary } from "cloudinary";

export const getCurrentUser = async (userId: TUserId): Promise<IUser> => {
  const user = await User.findById(userId).select("-__v").lean().exec();

  if (!user) {
    throw new UserError(
      "User not found",
      HttpStatusCodes.NOT_FOUND,
      "NotFound",
    );
  }

  logger.info("Current user retrieved successfully", { userId });
  return user;
};

export const updateCurrentUser = async (
  userId: TUserId,
  updateData: IUpdateUserData,
): Promise<IUser> => {
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
  } = updateData;

  const user = await User.findById(userId).select("+password -__v").exec();

  if (!user) {
    throw new UserError(
      "User not found",
      HttpStatusCodes.NOT_FOUND,
      "NotFound",
    );
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

  return user;
};

export const deleteCurrentUser = async (userId: TUserId): Promise<void> => {
  const userExists = await User.exists({ _id: userId });
  if (!userExists) {
    throw new UserError(
      "User not found",
      HttpStatusCodes.NOT_FOUND,
      "NotFound",
    );
  }

  await cleanupUserData(userId);
  logger.info("Current user deleted successfully", { userId });
};

export const getUser = async (userId: TUserId): Promise<IUser> => {
  const user = await User.findById(userId).select("-__v").lean().exec();

  if (!user) {
    throw new UserError(
      "User not found",
      HttpStatusCodes.NOT_FOUND,
      "NotFound",
    );
  }

  logger.info("User retrieved successfully", { userId });
  return user;
};

export const deleteUser = async (userId: TUserId): Promise<void> => {
  const userExists = await User.exists({ _id: userId });
  if (!userExists) {
    throw new UserError(
      "User not found",
      HttpStatusCodes.NOT_FOUND,
      "NotFound",
    );
  }

  await cleanupUserData(userId);
  logger.info("User deleted successfully", { userId });
};

export const getAllUsers = async (
  limit?: number,
  offset?: number,
): Promise<IUserListResponse> => {
  const resolvedLimit = limit || DEFAULT_RES_LIMIT;
  const resolvedOffset = offset || DEFAULT_RES_OFFSET;

  const total = await User.countDocuments();

  const users = await User.find()
    .select("-__v")
    .limit(resolvedLimit)
    .skip(resolvedOffset)
    .lean()
    .exec();

  logger.info("All users retrieved successfully", {
    limit: resolvedLimit,
    offset: resolvedOffset,
    total,
    count: users.length,
  });

  return {
    limit: resolvedLimit,
    offset: resolvedOffset,
    total,
    users,
  };
};

const cleanupUserData = async (userId: TUserId): Promise<void> => {
  try {
    const blogs = await Blog.find({ author: userId })
      .select("banner.publicId")
      .lean()
      .exec();

    const publicIds = blogs
      .map(({ banner }) => banner.publicId)
      .filter(Boolean);
    if (publicIds.length > 0) {
      await cloudinary.api.delete_resources(publicIds);
      logger.info("Blog banners deleted from Cloudinary", {
        publicIds,
        count: publicIds.length,
      });
    }

    const deletedBlogs = await Blog.deleteMany({ author: userId });
    logger.info("User blogs deleted", {
      userId,
      deletedCount: deletedBlogs.deletedCount,
    });

    await User.deleteOne({ _id: userId });
    logger.info("User account deleted", { userId });
  } catch (error) {
    logger.error("Error during user data cleanup", { userId, error });
    throw new UserError(
      "Failed to cleanup user data",
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      "CleanupError",
    );
  }
};
