import { Types } from "mongoose";

export interface IToken {
  token: string;
  userId: Types.ObjectId;
}
