export class AuthResponse {
  accessToken: string;
  static build = (accessToken: string) => {
    const tokenResponse = new AuthResponse();
    tokenResponse.accessToken = accessToken;
    return tokenResponse;
  };
}