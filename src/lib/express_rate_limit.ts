import config from "@/config";
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: config.REQ_WINDOWS_MS,
  limit: config.REQ_LIMIT,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error:
      "You have sent too many requests in a given amount of time! Please try again later!",
  },
});

export default limiter;
