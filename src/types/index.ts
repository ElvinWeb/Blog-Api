import { IUser } from "@/models/User.model";

export type TUserRegisterData = Pick<IUser, "email" | "password" | "role">;
export type TUserLoginData = Pick<IUser, "email" | "password">;
export type TAuthRole = "admin" | "user";