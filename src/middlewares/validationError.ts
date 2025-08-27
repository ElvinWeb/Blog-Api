import { HttpStatusCodes } from "@/constants/api.constants";
import type { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

const validationError = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(HttpStatusCodes.BAD_REQUEST).json({
      code: "ValidationError",
      errors: errors.mapped(),
    });
    return;
  }

  next();
};

export default validationError;
