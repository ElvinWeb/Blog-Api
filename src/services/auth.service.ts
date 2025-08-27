import config from "@/config";
import { HttpStatusCodes } from "@/constants/api.constants";
import { UserRoles } from "@/constants/user.constants";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "@/libs/jwt";
import { logger } from "@/libs/winston";
import Token from "@/models/token.model";
import User from "@/models/user.model";
import { IAuthError, IAuthResponse, IRefreshTokenResponse } from "@/types/auth.types";
import { TUserLoginData, TUserRegisterData } from "@/types/user.types";
import { generateUsername } from "@/utils/generate";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { Types } from "mongoose";

export const login = async (
  loginData: TUserLoginData,
): Promise<{
  authResponse: IAuthResponse;
  refreshToken: string;
}> => {
  const { email } = loginData;

  const user = await User.findOne({ email })
    .select("username email password role")
    .lean()
    .exec();

  if (!user) {
    throw new IAuthError(
      "User not found!",
      HttpStatusCodes.NOT_FOUND,
      "NotFound",
    );
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  await Token.create({ token: refreshToken, userId: user._id });

  logger.info("Refresh token created for user", {
    userId: user._id,
    token: refreshToken,
  });

  logger.info("User login successfully", user);

  return {
    authResponse: {
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
      },
      accessToken,
    },
    refreshToken,
  };
};

export const register = async (
  registerData: TUserRegisterData,
): Promise<{
  authResponse: IAuthResponse;
  refreshToken: string;
}> => {
  const { email, password, role } = registerData;

  if (
    role === UserRoles.ADMIN &&
    !config.WHITELIST_ADMINS_MAIL.includes(email)
  ) {
    logger.warn(
      `User with email ${email} tried to register as an admin but is not in the whitelist!`,
    );
    throw new IAuthError(
      "You cannot register as an admin!",
      HttpStatusCodes.FORBIDDEN,
      "AuthorizationError",
    );
  }

  const username = generateUsername();
  const newUser = await User.create({
    username,
    email,
    password,
    role,
  });

  const accessToken = generateAccessToken(newUser._id);
  const refreshToken = generateRefreshToken(newUser._id);

  await Token.create({ token: refreshToken, userId: newUser._id });

  logger.info("Refresh token created for user", {
    userId: newUser._id,
    token: refreshToken,
  });

  logger.info("User registered successfully", {
    username: newUser.username,
    email: newUser.email,
    role: newUser.role,
  });

  return {
    authResponse: {
      user: {
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
      accessToken,
    },
    refreshToken,
  };
};

export const logout = async (
  refreshToken: string,
  userId?: Types.ObjectId,
): Promise<void> => {
  if (refreshToken) {
    await Token.deleteOne({ token: refreshToken });

    logger.info("User refresh token deleted successfully", {
      userId,
      token: refreshToken,
    });
  }

  logger.info("User logged out successfully", { userId });
};

export const refreshToken = async (
  refreshToken: string,
): Promise<IRefreshTokenResponse> => {
  if (!refreshToken) {
    throw new IAuthError(
      "Refresh token is required!",
      HttpStatusCodes.UNAUTHORIZED,
      "AuthenticationError",
    );
  }

  const tokenExists = await Token.exists({ token: refreshToken });

  if (!tokenExists) {
    throw new IAuthError(
      "Invalid refresh token!",
      HttpStatusCodes.UNAUTHORIZED,
      "AuthenticationError",
    );
  }

  try {
    const jwtPayload = verifyRefreshToken(refreshToken) as {
      userId: Types.ObjectId;
    };

    const accessToken = generateAccessToken(jwtPayload.userId);

    return { accessToken };
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      await Token.deleteOne({ token: refreshToken });
      throw new IAuthError(
        "Refresh token expired, please login again",
        HttpStatusCodes.UNAUTHORIZED,
        "AuthenticationError",
      );
    }

    if (err instanceof JsonWebTokenError) {
      throw new IAuthError(
        "Invalid refresh token!",
        HttpStatusCodes.UNAUTHORIZED,
        "AuthenticationError",
      );
    }

    logger.error("Error during refresh token verification!", err);
    throw err;
  }
};
