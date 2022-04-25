import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GraphService } from '@TIBCOSoftware/labs-air-graph-client';
import { AppConfigService } from 'common';

@Injectable({
  providedIn: 'root'
})
export class DGraphService extends GraphService {

  constructor(http: HttpClient, appConfigService: AppConfigService) {
    super(http, appConfigService.getFromConfigOrEnv('dgraphUrl'), false);
   }
}
