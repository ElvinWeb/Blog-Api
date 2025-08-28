import type { NextFunction, Request, Response } from "express";
import { HttpStatusCodes } from "../constants/api.constants";
import { logger } from "../libs/winston";
import User from "../models/user.model";
import { TAuthRole } from "../types/user.types";

const authorize = (roles: TAuthRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;

    try {
      const user = await User.findById(userId).select("role").exec();

      if (!user) {
        res.status(HttpStatusCodes.NOT_FOUND).json({
          code: "NotFound",
          message: "User not found!",
        });
        return;
      }

      if (!roles.includes(user.role)) {
        res.status(HttpStatusCodes.FORBIDDEN).json({
          code: "AuthorizationError",
          message: "Access denied, insufficient permissions!",
        });
        return;
      }

      return next();
    } catch (err) {
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        code: "ServerError",
        message: "Internal server error!",
        error: err,
      });

      logger.error("Error while authorizing user!", err);
    }
  };
};

export default authorize;
