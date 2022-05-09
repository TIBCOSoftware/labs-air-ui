import { NgModule, APP_INITIALIZER, enableProdMode } from '@angular/core';
import { AppConfigService } from 'common';
import { HttpClientModule } from "@angular/common/http";
import { BrowserModule } from '@angular/platform-browser';
import { MaterialModule } from './material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe, PathLocationStrategy } from '@angular/common';
import { NgxHeatmapModule } from 'ngx-heatmap';
import { NgChartsModule } from 'ng2-charts';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LocationStrategy } from '@angular/common';
import { StarterAppComponent } from './routes/starter-app/starter-app.component';
import { SplashComponent } from './routes/splash/splash.component';
import { HomeComponent } from './routes/home/home.component';
import { IotHomeCockpitComponent } from './components/iot-home-cockpit/iot-home-cockpit.component';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { BASE_PATH, Configuration, GraphService } from '@TIBCOSoftware/labs-air-graph-client';
import { Ng2GoogleChartsModule } from 'ng2-google-charts';
import { IotGatewayDashboardComponent } from './components/iot-gateway-dashboard/iot-gateway-dashboard.component';
import { SpotfireDashboardComponent } from './components/spotfire-dashboard/spotfire-dashboard.component';
import { IotDashboardComponent } from './components/iot-dashboard/iot-dashboard.component';
import { CommonLibraryModule } from 'common';
import { ApiModule as LabsAirGraphApiModule } from '@TIBCOSoftware/labs-air-graph-client';
import { DGraphCloudService } from './services/graph/dgraph-cloud.service';
import { AuthorizationService } from './services/authorization.service';
import { Requestor, FetchRequestor } from '@openid/appauth';
import { CallbackComponent } from './routes/callback/callback.component';
import { TokenService } from './services/token.service';

const appInitializerFn = (appConfigService: AppConfigService) => {
  return () => {
    let appConfig = appConfigService.loadAppConfig();
    if (appConfig.production) {
      enableProdMode();
    }
    return appConfig;
  };
};

const configurationProviderPath = (appConfigService: AppConfigService) => {
  return appConfigService.getFromConfigOrEnv('dgraphUrl');
};

const loadAuthorizationConfig = (appConfigService: AppConfigService) => {
  try {
    return appConfigService.getConfig();
  } catch (err) {
    console.log('No configuration available. The authorization service will report an error');
    return {}
  }
}

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
    CallbackComponent
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
    LabsAirGraphApiModule
  ],
  providers: [
    AppConfigService,
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFn,
      multi: true,
      deps: [AppConfigService]
    },
    DatePipe,
    AuthorizationService,
    TokenService,
    { provide: BASE_PATH, useFactory: configurationProviderPath, deps: [AppConfigService] },
    {
      provide: Configuration,
      useFactory: (appConfigService: AppConfigService, tokenService: TokenService) =>
        new Configuration(
          {
            basePath: appConfigService.getFromConfigOrEnv('dgraphUrl'),
            accessToken: tokenService.oauthToken ? tokenService.oauthToken : ''
          }),
      deps: [AppConfigService, TokenService]
    },
    { provide: GraphService, useClass: DGraphCloudService },
    { provide: LocationStrategy, useClass: PathLocationStrategy },
    { provide: Requestor, useValue: new FetchRequestor()},
    { provide: 'AuthorizationConfig', deps: [AppConfigService], useFactory: loadAuthorizationConfig}
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
