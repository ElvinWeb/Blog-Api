import { Types } from "mongoose";

export class UserError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
  ) {
    super(message);
    this.name = "UserError";
  }
}

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

export interface IUpdateUserData {
  username?: string;
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  x?: string;
  youtube?: string;
}

export interface IUserListResponse {
  limit: number;
  offset: number;
  total: number;
  users: IUser[];
}

export type TUserRegisterData = Pick<IUser, "email" | "password" | "role">;
export type TUserLoginData = Pick<IUser, "email" | "password">;
export type TUserId = Types.ObjectId | undefined | string;
export type TAuthRole = "admin" | "user";
