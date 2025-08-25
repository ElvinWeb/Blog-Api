import config from "@/config";
import { HttpStatusCodes } from "@/constants/api.constants";
import { logger } from "@/lib/winston";
import { IAuthError } from "@/types/auth.types";
import type { Response } from "express";

export const handleError = (res: Response, err: unknown): void => {
  if (err instanceof IAuthError) {
    res.status(err.statusCode).json({
      code: err.code,
      message: err.message,
    });
    return;
  }

  if (err && typeof err === "object" && "name" in err) {
    if (err.name === "ValidationError") {
      res.status(HttpStatusCodes.BAD_REQUEST).json({
        code: "ValidationError",
        message: "Invalid input data",
        error: err,
      });
      return;
    }

    if (err.name === "CastError") {
      res.status(HttpStatusCodes.BAD_REQUEST).json({
        code: "InvalidId",
        message: "Invalid ID format",
      });
      return;
    }

    if (
      err.name === "MongoServerError" &&
      "code" in err &&
      err.code === 11000
    ) {
      res.status(HttpStatusCodes.CONFLICT).json({
        code: "ConflictError",
        message: "User already exists",
      });
      return;
    }
  }

  res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
    code: "ServerError",
    message: "Internal server error",
    error: config.NODE_ENV === "development" ? err : undefined,
  });

  logger.error("Unexpected error in user controller", err);
};
