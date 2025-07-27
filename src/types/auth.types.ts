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
