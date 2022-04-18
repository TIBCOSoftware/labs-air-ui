import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import * as _ from 'lodash';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AppConfigService {
    private appConfig = null;

    constructor(private http: HttpClient) { }

    loadAppConfig() {
        return lastValueFrom(this.http.get('/assets/data/appConfig.json'))
            .then(data => {
                console.log('the application config is', data)
                this.appConfig = data;
            });
    }

    getConfig() {
        return this.appConfig;
    }

    public getFromConfigOrEnv(path) {
        let loadedFrom = 'config';
        const value = this.getFromConfig(path);
        if (typeof value == 'undefined') {
            loadedFrom = 'environment';
            return this.getFromEnv(path);
        }
        console.log(`loaded ${value} for property ${path} using the ${loadedFrom}`);
        return value;
    }


    public getFromConfig(path) {
        let value = null;
        if (this.getConfig()) {
            value = _.get(this.getConfig(), path);
        }
        return value;
    }

    public getFromEnv(path) {
        let value = null;
        if (environment) {
            value = _.get(environment, path);
        }
        return value;
    }
}