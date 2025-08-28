import rateLimit from "express-rate-limit";
import { REQUEST_LIMIT, REQUEST_WINDOWS_MS } from "../constants/app.constants";

const limiter = rateLimit({
  windowMs: REQUEST_WINDOWS_MS,
  limit: REQUEST_LIMIT,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error:
      "You have sent too many requests in a given amount of time! Please try again later!",
  },
});

export default limiter;
