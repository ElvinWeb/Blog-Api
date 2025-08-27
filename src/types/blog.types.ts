import { Types } from "mongoose";

export interface IBlog {
  title: string;
  slug: string;
  content: string;
  banner: {
    publicId: string;
    url: string;
    width: number;
    height: number;
  };
  author: Types.ObjectId;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  status: TBlogStatus;
}

export interface IQueryStatus {
  status?: TBlogStatus;
}

export type TBlogData = Pick<IBlog, "title" | "content" | "banner" | "status">;
export type TBlogStatus = "draft" | "published";
