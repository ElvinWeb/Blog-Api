import config from "@/config";
import { HttpStatusCodes } from "@/constants/api.constants";
import { UserRoles } from "@/constants/user.constants";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "@/lib/jwt";
import { logger } from "@/lib/winston";
import Token from "@/models/Token.model";
import User from "@/models/User.model";
import { IAuthResponse, IRefreshTokenResponse } from "@/types/auth.types";
import { TUserLoginData, TUserRegisterData } from "@/types/user.types";
import { generateUsername } from "@/utils/generate.util";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { Types } from "mongoose";

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export class AuthService {
  async login(loginData: TUserLoginData): Promise<{
    authResponse: IAuthResponse;
    refreshToken: string;
  }> {
    const { email } = loginData;

    const user = await User.findOne({ email })
      .select("username email password role")
      .lean()
      .exec();

    if (!user) {
      throw new AuthError(
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
  }

  async register(registerData: TUserRegisterData): Promise<{
    authResponse: IAuthResponse;
    refreshToken: string;
  }> {
    const { email, password, role } = registerData;

    if (
      role === UserRoles.ADMIN &&
      !config.WHITELIST_ADMINS_MAIL.includes(email)
    ) {
      logger.warn(
        `User with email ${email} tried to register as an admin but is not in the whitelist!`,
      );
      throw new AuthError(
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
  }

  async logout(refreshToken: string, userId?: Types.ObjectId): Promise<void> {
    if (refreshToken) {
      await Token.deleteOne({ token: refreshToken });

      logger.info("User refresh token deleted successfully", {
        userId,
        token: refreshToken,
      });
    }

    logger.info("User logged out successfully", { userId });
  }

  async refreshToken(refreshToken: string): Promise<IRefreshTokenResponse> {
    if (!refreshToken) {
      throw new AuthError(
        "Refresh token is required!",
        HttpStatusCodes.UNAUTHORIZED,
        "AuthenticationError",
      );
    }

    const tokenExists = await Token.exists({ token: refreshToken });

    if (!tokenExists) {
      throw new AuthError(
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
        throw new AuthError(
          "Refresh token expired, please login again",
          HttpStatusCodes.UNAUTHORIZED,
          "AuthenticationError",
        );
      }

      if (err instanceof JsonWebTokenError) {
        throw new AuthError(
          "Invalid refresh token!",
          HttpStatusCodes.UNAUTHORIZED,
          "AuthenticationError",
        );
      }

      logger.error("Error during refresh token verification!", err);
      throw err;
    }
  }
}
