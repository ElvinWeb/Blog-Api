import config from "@/config";
import { HttpStatusCodes } from "@/constants/api.constants";
import { COOKIE_MAX_AGE_DURATION } from "@/constants/auth.constants";
import { Environments } from "@/constants/environment.constants";
import { logger } from "@/lib/winston";
import { AuthError, AuthService } from "@/services/auth.service";
import { TUserLoginData, TUserRegisterData } from "@/types/user.types";
import type { Request, Response } from "express";

export class AuthController {
  constructor(private authService: AuthService) {}

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const loginData = req.body as TUserLoginData;

      const { authResponse, refreshToken } =
        await this.authService.login(loginData);

      this.setRefreshTokenCookie(res, refreshToken);

      res.status(HttpStatusCodes.OK).json(authResponse);
    } catch (err) {
      this.handleError(res, err);
    }
  };

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const registerData = req.body as TUserRegisterData;

      const { authResponse, refreshToken } =
        await this.authService.register(registerData);

      this.setRefreshTokenCookie(res, refreshToken);

      res.status(HttpStatusCodes.OK).json(authResponse);
    } catch (err) {
      this.handleError(res, err);
    }
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const refreshToken = req.cookies.refreshToken as string;

      await this.authService.logout(refreshToken, req.userId);

      this.clearRefreshTokenCookie(res);

      res.sendStatus(HttpStatusCodes.NO_CONTENT);
    } catch (err) {
      this.handleError(res, err);
    }
  };

  refreshToken = async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies.refreshToken as string;

      const result = await this.authService.refreshToken(refreshToken);

      res.status(HttpStatusCodes.OK).send(result);
    } catch (err) {
      if (err instanceof AuthError && err.code === "AuthenticationError") {
        this.clearRefreshTokenCookie(res);
      }
      this.handleError(res, err);
    }
  };

  private setRefreshTokenCookie(res: Response, refreshToken: string): void {
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === Environments.PRODUCTION,
      sameSite: "strict",
      maxAge: COOKIE_MAX_AGE_DURATION,
    });
  }

  private clearRefreshTokenCookie(res: Response): void {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: config.NODE_ENV === Environments.PRODUCTION,
      sameSite: "strict",
    });
  }

  private handleError(res: Response, err: unknown): void {
    if (err instanceof AuthError) {
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
  }
}
