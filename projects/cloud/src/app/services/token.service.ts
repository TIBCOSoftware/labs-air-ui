import { Injectable } from "@angular/core";
import { TokenResponse } from "@openid/appauth";

@Injectable()
export class TokenService {
  private token: TokenResponse;

  public tokenResponse(tokenResponse: TokenResponse) {
    this.token = tokenResponse;
  }

  get oauthToken(): string | undefined {
    return this.token?.accessToken;
  }

  get refreshToken(): string | undefined {
    return this.token?.refreshToken;
  }

}