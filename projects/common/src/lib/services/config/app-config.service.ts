import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, lastValueFrom, of } from 'rxjs';

@Injectable()
export class AppConfigService {
    private appConfig = {};

    constructor(private http: HttpClient) {
        this.loadAppConfig();
    }

    loadAppConfig(): any {
        return lastValueFrom(this.http.get('/assets/data/appConfig.json'))
            .then(data => {
                console.log('the application config is', data)
                this.appConfig = data;
            }, err => {
                console.log('Could not load the application configuration!', err);
                return of({});
            });
    }

    getConfig() {
        return this.appConfig;
    }

    public getFromConfigOrEnv(path) {
        const value = this.appConfig[path];
        if (typeof value == 'undefined') {
            throw new Error(`Required setting ${path} is undefined!`)
        }
        console.log(`loaded ${value} for property ${path} using the config`);
        return value;
    }
}