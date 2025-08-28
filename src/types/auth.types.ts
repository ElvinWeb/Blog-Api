export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export interface IAuthResponse {
  user: {
    username: string;
    email: string;
    role: string;
  };
  accessToken: string;
}

export interface IRefreshTokenResponse {
  accessToken: string;
}
