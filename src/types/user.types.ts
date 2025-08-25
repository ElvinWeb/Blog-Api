import { Types } from "mongoose";

export interface IUser {
  username: string;
  email: string;
  password: string;
  role: TAuthRole;
  firstName?: string;
  lastName?: string;
  socialLinks?: {
    website?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    x?: string;
    youtube?: string;
  };
}

export type TUserRegisterData = Pick<IUser, "email" | "password" | "role">;
export type TUserLoginData = Pick<IUser, "email" | "password">;
export type TUserId = Types.ObjectId | undefined | string;
export type TAuthRole = "admin" | "user";
