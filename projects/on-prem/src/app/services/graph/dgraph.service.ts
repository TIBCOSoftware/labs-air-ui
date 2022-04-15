import { Injectable } from '@angular/core';
import { Axios } from 'axios-observable';
import { GraphService } from '@TIBCOSoftware/labs-air-graph-client';
import { AppConfigService } from 'common';

@Injectable({
  providedIn: 'root'
})
export class DGraphService extends GraphService {

  constructor(http: Axios, appConfigService: AppConfigService) {
    super(http, appConfigService.getFromConfigOrEnv('dgraphUrl'), false);
   }
}
