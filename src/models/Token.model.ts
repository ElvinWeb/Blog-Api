import { IToken } from "@/types/token.types";
import { model, Schema } from "mongoose";

const tokenSchema = new Schema<IToken>({
  token: {
    type: String,
    require: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    require: true,
  },
});

const Token = model<IToken>("Token", tokenSchema);

export default Token;
