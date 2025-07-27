import config from "@/config";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";
import { logger } from "@/lib/winston";

import Token from "@/models/Token.model";
import User from "@/models/User.model";
import { TUserLoginData } from "@/types";
import type { Request, Response } from "express";

const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body as TUserLoginData;

    const user = await User.findOne({ email })
      .select("username email password role")
      .lean()
      .exec();

    if (!user) {
      res.status(404).json({
        code: "NotFound",
        message: "User not found",
      });
      return;
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    await Token.create({ token: refreshToken, userId: user._id });
    logger.info("Refresh token created for user", {
      userId: user._id,
      token: refreshToken,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(201).json({
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
      },
      accessToken,
    });

    logger.info("User login successfully", user);
  } catch (err) {
    res.status(500).json({
      code: "ServerError",
      message: "Internal server error!",
      error: err,
    });

    logger.error("Error during user registration!", err);
  }
};

export default login;
