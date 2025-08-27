import config from "@/config";
import { HttpStatusCodes } from "@/constants/api.constants";
import { logger } from "@/libs/winston";
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

export const generateUsername = (): string => {
  const usernamePrefix = "user-";
  const randomChars = Math.random().toString(36).slice(2);

  const username = usernamePrefix + randomChars;

  return username;
};

export const generateSlug = (title: string): string => {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]\s-/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  const randomChars = Math.random().toString(36).slice(2);
  const uniqueSlug = `${slug}-${randomChars}`;

  return uniqueSlug;
};
