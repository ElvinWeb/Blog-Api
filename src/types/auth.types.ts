export interface IAuthResponse {
  user: {
    username: string;
    email: string;
    role: string;
  };
  accessToken: string;
}

export class IAuthError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export interface IRefreshTokenResponse {
  accessToken: string;
}
