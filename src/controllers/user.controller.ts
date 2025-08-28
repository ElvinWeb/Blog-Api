import type { Request, Response } from "express";
import { HttpStatusCodes } from "../constants/api.constants";
import * as userService from "../services/user.service";
import { IUpdateUserData } from "../types/user.types";
import { handleError } from "../utils";

export const getCurrentUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId;

    const user = await userService.getCurrentUser(userId);

    res.status(HttpStatusCodes.OK).json({
      user,
    });
  } catch (err) {
    handleError(res, err);
  }
};

export const updateCurrentUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId;
    const updateData = req.body as IUpdateUserData;

    const user = await userService.updateCurrentUser(userId, updateData);

    res.status(HttpStatusCodes.OK).json({
      user,
    });
  } catch (err) {
    handleError(res, err);
  }
};

export const deleteCurrentUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId;

    await userService.deleteCurrentUser(userId);

    res.sendStatus(HttpStatusCodes.NO_CONTENT);
  } catch (err) {
    handleError(res, err);
  }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId;

    const user = await userService.getUser(userId);

    res.status(HttpStatusCodes.OK).json({
      user,
    });
  } catch (err) {
    handleError(res, err);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.params.userId;

    await userService.deleteUser(userId);

    res.sendStatus(HttpStatusCodes.NO_CONTENT);
  } catch (err) {
    handleError(res, err);
  }
};

export const getAllUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string);
    const offset = parseInt(req.query.offset as string);

    const result = await userService.getAllUsers(limit, offset);

    res.status(HttpStatusCodes.OK).json(result);
  } catch (err) {
    handleError(res, err);
  }
};
