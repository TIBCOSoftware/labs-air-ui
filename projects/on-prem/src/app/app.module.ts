import { NgModule, APP_INITIALIZER, enableProdMode } from '@angular/core';
import {AppConfigService, DGraphCloudService} from 'common';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { MaterialModule } from './material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { NgxHeatmapModule } from 'ngx-heatmap';
import { NgChartsModule } from 'ng2-charts';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { StarterAppComponent } from './routes/starter-app/starter-app.component';
import { SplashComponent } from './routes/splash/splash.component';
import { HomeComponent } from './routes/home/home.component';
import { IotHomeCockpitComponent } from './components/iot-home-cockpit/iot-home-cockpit.component';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { Ng2GoogleChartsModule } from 'ng2-google-charts';
import { IotGatewayDashboardComponent } from './components/iot-gateway-dashboard/iot-gateway-dashboard.component';
import { SpotfireDashboardComponent } from './components/spotfire-dashboard/spotfire-dashboard.component';
import { IotDashboardComponent } from './components/iot-dashboard/iot-dashboard.component';
import { CommonLibraryModule } from 'common';
import {ApiModule, Configuration} from "@TIBCOSoftware/labs-air-graph-client";
import {TokenService} from "../../../cloud/src/app/services/token.service";
import {AuthorizationService} from "../../../cloud/src/app/services/authorization.service";

const appInitializerFn = (appConfigService: AppConfigService) => {
    return () => {
        let appConfig = appConfigService.loadAppConfig();
        if (appConfig.production) {
            enableProdMode();
        }
        return appConfig;
    };
};

@NgModule({
    declarations: [
        AppComponent,
        StarterAppComponent,
        SplashComponent,
        HomeComponent,
        IotHomeCockpitComponent,
        NavBarComponent,
        IotGatewayDashboardComponent,
        SpotfireDashboardComponent,
        IotDashboardComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        MaterialModule,
        NgxHeatmapModule,
        Ng2GoogleChartsModule,
        NgChartsModule,
        CommonLibraryModule,
        ApiModule
    ],
    providers: [
      {
        provide: Configuration,
        useFactory: (appConfigService: AppConfigService, tokenService: TokenService) =>
          new Configuration(
            {
              basePath: appConfigService.getFromConfigOrEnv('dgraphUrl'),
              accessToken:  ''
            }),
        deps: [AppConfigService, TokenService]
      },
      TokenService,
      DGraphCloudService,
        DatePipe,
        { provide: LocationStrategy, useClass: HashLocationStrategy },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
