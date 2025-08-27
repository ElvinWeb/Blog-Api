import config from "@/config";
import { logger } from "@/libs/winston";
import type { ConnectOptions } from "mongoose";
import mongoose from "mongoose";

const clientOptions: ConnectOptions = {
  dbName: "blog-db",
  appName: "Blog API",
  serverApi: {
    version: "1",
    strict: true,
    deprecationErrors: true,
  },
};

export const connectToDatabase = async (): Promise<void> => {
  if (!config.MONGO_URI) {
    throw new Error("MongoDB URI is not defined in the configuration!");
  }

  try {
    await mongoose.connect(config.MONGO_URI, clientOptions);

    logger.info("Connected to the database successfully!", {
      uri: config.MONGO_URI,
      options: clientOptions,
    });
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    }

    logger.error("Error connecting to the database!", err);
  }
};

export const disconnectFromDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();

    logger.info("Disconnected from the database successfully!", {
      uri: config.MONGO_URI,
      options: clientOptions,
    });
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }

    logger.error("Error disconnecting from the database!", err);
  }
};
