import config from "@/config";
import { HttpStatusCodes } from "@/constants/api.constants";
import { COOKIE_MAX_AGE_DURATION } from "@/constants/cookie.constants";
import { Environments } from "@/constants/environment.constants";
import * as authService from "@/services/auth.service";
import { IAuthError } from "@/types/auth.types";
import { TUserLoginData, TUserRegisterData } from "@/types/user.types";
import { handleError } from "@/utils/error";
import type { Request, Response } from "express";

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const loginData = req.body as TUserLoginData;

    const { authResponse, refreshToken } = await authService.login(loginData);

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

const setRefreshTokenCookie = (res: Response, refreshToken: string): void => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: config.NODE_ENV === Environments.PRODUCTION,
    sameSite: "strict",
    maxAge: COOKIE_MAX_AGE_DURATION,
  });
};

const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: config.NODE_ENV === Environments.PRODUCTION,
    sameSite: "strict",
  });
};
