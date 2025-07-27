import dotenv from "dotenv";

dotenv.config();

const config = {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  MONGO_URI: process.env.MONGO_URI,
  LOG_LEVEL: process.env.LOG_LEVEL,
  WHITELIST_ORIGINS: ["http://localhost:4000/"],
};

export default config;
