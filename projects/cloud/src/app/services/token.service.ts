import { Injectable } from "@angular/core";
import { TokenResponse } from "@openid/appauth";
import { UserInfo } from "../model/userinfo";

@Injectable()
export class TokenService {
  private token: TokenResponse;
  private userInfo: UserInfo;

  public setTokenResponse(tokenResponse: TokenResponse) {
    this.token = tokenResponse;
  }

  public setUserinfo(userinfo: UserInfo) {
    this.userInfo = userinfo;
  }

  get userinfo() {
    return this.userInfo;
  }

  get oauthToken(): string | undefined {
    return this.token?.accessToken;
  }

  get refreshToken(): string | undefined {
    return this.token?.refreshToken;
  }

}