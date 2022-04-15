import { Injectable } from '@angular/core';
import { AppConfigService } from 'dist/common/fesm2015/common';
import { Axios } from 'axios-observable';
import { GraphService } from '@TIBCOSoftware/labs-air-graph-client';

@Injectable({
  providedIn: 'root'
})
export class DGraphService extends GraphService {

  constructor(http: Axios, appConfigService: AppConfigService) {
    super(http, appConfigService.getFromConfigOrEnv('dgraphUrl'), false);
   }
}
