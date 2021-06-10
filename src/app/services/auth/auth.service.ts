import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  constructor() {  }

  basicAuthHeaders: Map<string, string> = new Map([["Authorization","Basic YWRtaW46YWRtaW4="]]);

  getBasicAuthHeaders() {
    return this.basicAuthHeaders;
  }
}