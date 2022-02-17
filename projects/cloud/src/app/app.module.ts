import { NgModule, APP_INITIALIZER } from '@angular/core';
import { AppConfigService } from './services/config/app-config.service';
import { HttpClientModule } from "@angular/common/http";
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
import { GraphService } from './services/graph/graph.service';
import { DgraphService } from './services/graph/dgraph.service';
import { Ng2GoogleChartsModule } from 'ng2-google-charts';
import { IotGatewayEndpointComponent } from './components/iot-gateway-endpoint/iot-gateway-endpoint.component';
import { IgeModelsComponent } from './components/iot-gateway-endpoint/ige-models/ige-models.component';
import { IgeDataStoresComponent } from './components/iot-gateway-endpoint/ige-data-stores/ige-data-stores.component';
import { IgeProtocolsComponent } from './components/iot-gateway-endpoint/ige-protocols/ige-protocols.component';
import { IotGatewayDashboardComponent } from './components/iot-gateway-dashboard/iot-gateway-dashboard.component';
import { SpotfireDashboardComponent } from './components/spotfire-dashboard/spotfire-dashboard.component';
import { CommonIotStoreSimulatorComponent } from 'common';
import { CommonIotTextileSimulatorComponent } from 'common';
import { IotDashboardComponent } from './components/iot-dashboard/iot-dashboard.component';

import { CommonLibraryModule } from 'common';
import { LoginComponent } from './routes/login/login.component';
import { LoginOauthComponent } from './routes/login-oauth/login-oauth.component';

import {
  LogService, OAuthInterceptor,
  ProxyInterceptor,
  SessionRefreshService,
  TcCoreConfig,
  TcCoreConfigService,
  TcCoreLibModule
} from '@tibco-tcstk/tc-core-lib';
import { TcFormsLibModule } from '@tibco-tcstk/tc-forms-lib';
import { TcLiveappsLibModule } from '@tibco-tcstk/tc-liveapps-lib';


const appInitializerFn = (appConfig: AppConfigService) => {
  return () => {
    return appConfig.loadAppConfig();
  };
};

const tcCoreConfig: TcCoreConfig = {
  disableFormLibs: false,
  // for test mode ONLY you can enter an oAuth key as the local storage key as long as it starts CIC~
  // do NOT use this for production code - instead enter the local storage key where external app will save oauth key.
  // oauth keys should NEVER be saved in code for production or when checked into source control!
  // oAuthLocalStorageKey: 'TC_DEV_KEY',
  oAuthLocalStorageKey: '',
  proxy_url: '',
  proxy_liveapps_path: '',
  proxy_tce_path: '',
  api_key: '',
  api_key_param: 'api_key',
  enable_tce: false
}
@NgModule({
  declarations: [
    AppComponent,
    StarterAppComponent,
    SplashComponent,
    HomeComponent,
    IotHomeCockpitComponent,
    NavBarComponent,
    IotGatewayEndpointComponent,
    IgeModelsComponent,
    IgeDataStoresComponent,
    IgeProtocolsComponent,
    IotGatewayDashboardComponent,
    SpotfireDashboardComponent,
    IotDashboardComponent,
    LoginComponent,
    LoginOauthComponent
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
    TcCoreLibModule.forRoot(tcCoreConfig),
    TcFormsLibModule,
    TcLiveappsLibModule.forRoot(),    
    CommonLibraryModule
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
    { provide: GraphService, useClass: DgraphService },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    LogService,
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
