import { HttpStatusCodes } from "@/constants/api.constants";
import * as authService from "@/services/auth.service";
import { AuthError } from "@/types/auth.types";
import { TUserLoginData, TUserRegisterData } from "@/types/user.types";
import { handleError } from "@/utils";
import type { Request, Response } from "express";

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const loginData = req.body as TUserLoginData;
    const { authResponse, refreshToken } = await authService.login(loginData);

    authService.setRefreshTokenCookie(res, refreshToken);

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

    authService.setRefreshTokenCookie(res, refreshToken);

    res.status(HttpStatusCodes.OK).json(authResponse);
  } catch (err) {
    handleError(res, err);
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken as string;
    await authService.logout(refreshToken, req.userId);

    authService.clearRefreshTokenCookie(res);

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
    if (err instanceof AuthError && err.code === "AuthenticationError") {
      authService.clearRefreshTokenCookie(res);
    }
    handleError(res, err);
  }
};
