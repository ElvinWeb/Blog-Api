import { model, Schema } from "mongoose";
import { IUser } from "../types/user.types";

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      masLength: [20, "Username must be less than 20 characters"],
      unique: [true, "Username must be unique"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      maxLength: [50, "Email must be less than 50 characters"],
      unique: [true, "Email must be unique"],
    },
    password: {
      type: String,
      required: [true, "password is required"],
      select: false,
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: {
        values: ["admin", "user"],
        message: "{VALUE} is not supported",
      },
      default: "user",
    },
    firstName: {
      type: String,
      maxLength: [20, "First name must be less than 20 characters"],
    },
    lastName: {
      type: String,
      maxLength: [20, "Last name must be less than 20 characters"],
    },
    socialLinks: {
      website: {
        type: String,
        maxLength: [100, "Website address must be less than 100 characters"],
      },
      facebook: {
        type: String,
        maxLength: [
          100,
          "Facebook profile url must be less than 100 characters",
        ],
      },
      instagram: {
        type: String,
        maxLength: [
          100,
          "Instagram profile url must be less than 100 characters",
        ],
      },
      linkedin: {
        type: String,
        maxLength: [
          100,
          "LinkedIn profile url must be less than 100 characters",
        ],
      },
      x: {
        type: String,
        maxLength: [100, "X profile url must be less than 100 characters"],
      },
      youtube: {
        type: String,
        maxLength: [
          100,
          "Youtube channel url must be less than 100 characters",
        ],
      },
    },
  },
  {
    timestamps: true,
  },
);

const User = model<IUser>("User", userSchema);

export default User;
