import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  constructor() {  }

  basicAuthHeaders = {}

  getBasicAuthHeaders() {
    this.basicAuthHeaders = {
        'Authorization': 'Basic YWRtaW46YWRtaW4='
    }
    return this.basicAuthHeaders;
  }
}