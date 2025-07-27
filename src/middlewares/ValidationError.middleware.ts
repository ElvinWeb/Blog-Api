import { validationResult } from "express-validator";

import type { Request, Response, NextFunction } from "express";
import { HttpStatusCodes } from "@/constants/api.constants";

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
