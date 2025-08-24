import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

import { verifyAccessToken } from "@/lib/jwt";
import { logger } from "@/lib/winston";

import type { Request, Response, NextFunction } from "express";
import type { Types } from "mongoose";
import { HttpStatusCodes } from "@/constants/api.constants";

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(HttpStatusCodes.UNAUTHORIZED).json({
      code: "AuthenticationError",
      message: "Access denied, no token provided!",
    });
    return;
  }

  const [_, token] = authHeader.split(" ");

  try {
    const jwtPayload = verifyAccessToken(token) as { userId: Types.ObjectId };

    req.userId = jwtPayload.userId;

    return next();
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      res.status(HttpStatusCodes.UNAUTHORIZED).json({
        code: "AuthenticationError",
        message: "Access token expired, request a new one with refresh token!",
      });
      return;
    }

    if (err instanceof JsonWebTokenError) {
      res.status(HttpStatusCodes.UNAUTHORIZED).json({
        code: "AuthenticationError",
        message: "Access token invalid!",
      });
      return;
    }

    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      code: "ServerError",
      message: "Internal server error!",
      error: err,
    });

    logger.error("Error during authentication!", err);
  }
};

export default authenticate;
