import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { TokenService } from '../services/token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(
    private tokenService: TokenService
    ) { }

  public async canActivate(): Promise<boolean> {
    if (this.tokenService.oauthToken) {
      return true;
    } else {
      return false;
    }
  }
}
