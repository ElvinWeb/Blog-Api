import config from "@/config";
import { HttpStatusCodes } from "@/constants/api.constants";
import { COOKIE_MAX_AGE_DURATION } from "@/constants/auth.constants";
import { Environments } from "@/constants/environment.constants";
import { logger } from "@/lib/winston";
import { TUserLoginData, TUserRegisterData } from "@/types/user.types";
import { IAuthError } from "@/types/auth.types";
import type { Request, Response } from "express";
import * as authService  from "@/services/auth.service";

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const loginData = req.body as TUserLoginData;

    const { authResponse, refreshToken } =
      await authService.login(loginData);

    setRefreshTokenCookie(res, refreshToken);

    res.status(HttpStatusCodes.OK).json(authResponse);
  } catch (err) {
    handleError(res, err);
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const registerData = req.body as TUserRegisterData;

    const { authResponse, refreshToken } =
      await authService.register(registerData);

    setRefreshTokenCookie(res, refreshToken);

    res.status(HttpStatusCodes.OK).json(authResponse);
  } catch (err) {
    handleError(res, err);
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken as string;

    await authService.logout(refreshToken, req.userId);

    clearRefreshTokenCookie(res);

    res.sendStatus(HttpStatusCodes.NO_CONTENT);
  } catch (err) {
    handleError(res, err);
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken as string;

    const result = await authService.refreshToken(refreshToken);

    res.status(HttpStatusCodes.OK).send(result);
  } catch (err) {
    if (err instanceof IAuthError && err.code === "AuthenticationError") {
      clearRefreshTokenCookie(res);
    }
    handleError(res, err);
  }
};

export const setRefreshTokenCookie = (
  res: Response,
  refreshToken: string,
): void => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: config.NODE_ENV === Environments.PRODUCTION,
    sameSite: "strict",
    maxAge: COOKIE_MAX_AGE_DURATION,
  });
};

export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: config.NODE_ENV === Environments.PRODUCTION,
    sameSite: "strict",
  });
};

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

  logger.error("Unexpected error in auth controller", err);
};
