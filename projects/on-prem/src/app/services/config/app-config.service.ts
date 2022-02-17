import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../shared/environments/environment';

import * as _ from 'lodash';

@Injectable()
export class AppConfigService {
  private appConfig = null;

  constructor(private http: HttpClient) { }

  loadAppConfig() {
      return this.http.get('/assets/data/appConfig.json')
          .toPromise()
          .then(data => {
              this.appConfig = data;
          });
  }

  getConfig() {
      return this.appConfig;
  }

  public getFromConfigOrEnv(path){
      const value = this.getFromConfig(path);
      if (typeof value == 'undefined'){
          return this.getFromEnv(path);
      }
      return value;
  }


  public getFromConfig(path){
      let value = null;
      if (this.getConfig()){
          value = _.get(this.getConfig(), path);
      }
      return value;
  }

  public getFromEnv(path){
      let value = null;
      if (environment){
          value = _.get(environment, path);
      }
      return value;
  }
}
