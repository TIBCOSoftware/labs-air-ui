import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AppComponent } from './app.component';
import {CredentialsService, TcLiveappsLibModule} from '@tibco-tcstk/tc-liveapps-lib';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MaterialModule } from './material.module';
import { ReteEditorModule } from './components/rete/rete.module';
import {
  LogService, OAuthInterceptor,
  ProxyInterceptor,
  SessionRefreshService,
  TcCoreConfig,
  TcCoreConfigService,
  TcCoreLibModule
} from '@tibco-tcstk/tc-core-lib';
import {TcFormsLibModule} from '@tibco-tcstk/tc-forms-lib';
import {LoginComponent} from './routes/login/login.component';
import {HomeComponent} from './routes/home/home.component';
import {StarterAppComponent} from './routes/starter-app/starter-app.component';
import {CaseComponent} from './routes/case/case.component';
import { ConfigurationComponent } from './routes/configuration/configuration.component';
import { SettingsLandingComponent } from './routes/settings-landing/settings-landing.component';
import { SplashComponent } from './routes/splash/splash.component';
import { AppRoutingModule } from './app-routing.module';
import { IotHomeCockpitComponent } from './components/iot-home-cockpit/iot-home-cockpit.component';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { ChartsModule } from 'ng2-charts';
import { Ng2GoogleChartsModule } from 'ng2-google-charts';
import { IotGatewayComponent } from './components/iot-gateway/iot-gateway.component';
import { IotDeviceComponent } from './components/iot-device/iot-device.component';
import { IotDeviceStreamComponent } from './components/iot-device-stream/iot-device-stream.component';
import { IotDeviceCommandComponent } from './components/iot-device-command/iot-device-command.component';
import { IotGatewaySubscriptionComponent } from './components/iot-gateway-subscription/iot-gateway-subscription.component';
import { IotDeviceDashboardComponent } from './components/iot-device-dashboard/iot-device-dashboard.component';
import { SpotfireViewerModule } from '@tibco/spotfire-wrapper';
import { IotDashboardComponent } from './components/iot-dashboard/iot-dashboard.component';
import { SpotfireDashboardComponent } from './components/spotfire-dashboard/spotfire-dashboard.component';
import { IotGatewayDashboardComponent } from './components/iot-gateway-dashboard/iot-gateway-dashboard.component';
import { IotDeviceProfileComponent } from './components/iot-device-profile/iot-device-profile.component';
import { IotDeviceProvisionComponent } from './components/iot-device-provision/iot-device-provision.component';
import { IotRulesComponent } from './components/iot-rules/iot-rules.component';
import { IotNotificationsComponent } from './components/iot-notifications/iot-notifications.component';
import { HttpClientModule } from "@angular/common/http";
import { MaporamaComponent } from './components/maporama/maporama.component';
import { TceRulesComponent } from './components/tce-rules/tce-rules.component';
import { IotDeviceSummaryComponent } from './components/iot-device-summary/iot-device-summary.component';
import { LiveAppsComponent } from './components/live-apps/live-apps.component';
import { LiveAppsCockpitComponent } from './components/live-apps-cockpit/live-apps-cockpit.component';
import { IotDataPipelineComponent } from './components/iot-data-pipeline/iot-data-pipeline.component';
import { ProtocolsComponent } from './components/iot-data-pipeline/protocols/protocols.component';
import { DataStoresComponent } from './components/iot-data-pipeline/data-stores/data-stores.component';
import { DataFilteringComponent } from './components/iot-data-pipeline/data-filtering/data-filtering.component';
import { DataStreamingComponent } from './components/iot-data-pipeline/data-streaming/data-streaming.component';
import { IotGatewayPublisherComponent } from './components/iot-gateway-publisher/iot-gateway-publisher.component';
import { DataFilteringViewComponent } from './components/iot-data-pipeline/data-filtering-view/data-filtering-view.component';
import { DataStoresViewComponent } from './components/iot-data-pipeline/data-stores-view/data-stores-view.component';
import { DataStreamingViewComponent } from './components/iot-data-pipeline/data-streaming-view/data-streaming-view.component';
import { ProtocolsViewComponent } from './components/iot-data-pipeline/protocols-view/protocols-view.component';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { GraphService } from './services/graph/graph.service';
import { DgraphService } from './services/graph/dgraph.service';
import { TgdbService } from './services/graph/tgdb.service';
import { IotGatewayEndpointComponent } from './components/iot-gateway-endpoint/iot-gateway-endpoint.component';
import { IgeProtocolsComponent } from './components/iot-gateway-endpoint/ige-protocols/ige-protocols.component';
import { IgeDataStoresComponent } from './components/iot-gateway-endpoint/ige-data-stores/ige-data-stores.component';
import { IotAnomalyDetectionDashboardComponent } from './components/iot-anomaly-detection-dashboard/iot-anomaly-detection-dashboard.component';
import { IotMlModelsComponent } from './components/iot-ml-models/iot-ml-models.component';
import { MatIconModule } from '@angular/material/icon';
import { LoginOauthComponent } from './routes/login-oauth/login-oauth.component';
import { NgxHeatmapModule } from 'ngx-heatmap';
import { IotEdgeDataPipelineComponent } from './components/iot-edge-data-pipeline/iot-edge-data-pipeline.component';
import { RulesComponent } from './components/iot-edge-data-pipeline/rules/rules.component';
import { InferencingComponent } from './components/iot-edge-data-pipeline/inferencing/inferencing.component';
import { FilteringComponent } from './components/iot-edge-data-pipeline/filtering/filtering.component';
import { IotGatewayDetailsComponent } from './components/iot-gateway-details/iot-gateway-details.component';
import { IotPipelineComponent } from './components/iot-pipeline/iot-pipeline.component';
import { PipelineFilteringComponent } from './components/iot-pipeline/pipeline-filtering/pipeline-filtering.component';
import { PipelineStreamingComponent } from './components/iot-pipeline/pipeline-streaming/pipeline-streaming.component';
import { IgeModelsComponent } from './components/iot-gateway-endpoint/ige-models/ige-models.component';
import { PipelineConfigComponent } from './components/iot-pipeline/pipeline-config/pipeline-config.component';
import { PipelineDataPipeComponent } from './components/iot-pipeline/pipeline-data-pipe/pipeline-data-pipe.component';
import { PipelineDataSourceComponent } from './components/iot-pipeline/pipeline-data-source/pipeline-data-source.component';
import { PipelineDataStoreComponent } from './components/iot-pipeline/pipeline-data-store/pipeline-data-store.component';
import { PipelineInferencingComponent } from './components/iot-pipeline/pipeline-inferencing/pipeline-inferencing.component';
import { PipelineRulesComponent } from './components/iot-pipeline/pipeline-rules/pipeline-rules.component';

/** This is the tc core configuration object
 * To use oauth you must also add the OAuthInterceptor to providers
 *  Note: Only HTTP calls that start with / will have oAuth token attached
 * To use proxy you must also add the ProxyInterceptor to providers
 *  Note: Only HTTP calls that start with / will be proxied
 *  Note: Enable TCE will request cookie for TCE API calls. This will only work if using the proxy
 */
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
    LoginComponent,
    LoginOauthComponent,
    StarterAppComponent,
    HomeComponent,
    CaseComponent,
    ConfigurationComponent,
    SettingsLandingComponent,
    SplashComponent,
    IotHomeCockpitComponent,
    NavBarComponent,
    IotGatewayComponent,
    IotDeviceComponent,
    IotDeviceStreamComponent,
    IotDeviceCommandComponent,
    IotDeviceDashboardComponent,
    IotGatewaySubscriptionComponent,
    SpotfireDashboardComponent,
    IotDashboardComponent,
    IotGatewayDashboardComponent,
    IotDeviceProfileComponent,
    IotDeviceProvisionComponent,
    IotRulesComponent,
    IotNotificationsComponent,
    MaporamaComponent,
    TceRulesComponent,
    IotDeviceSummaryComponent,
    LiveAppsComponent,
    LiveAppsCockpitComponent,
    IotDataPipelineComponent,
    ProtocolsComponent,
    DataStoresComponent,
    DataFilteringComponent,
    DataStreamingComponent,
    IotGatewayPublisherComponent,
    DataFilteringViewComponent,
    DataStoresViewComponent,
    DataStreamingViewComponent,
    ProtocolsViewComponent,
    IotGatewayEndpointComponent,
    IgeProtocolsComponent,
    IgeDataStoresComponent,
    IotAnomalyDetectionDashboardComponent,
    IotMlModelsComponent,
    IotEdgeDataPipelineComponent,
    RulesComponent,
    InferencingComponent,
    FilteringComponent,
    IotGatewayDetailsComponent,
    IotPipelineComponent,
    PipelineFilteringComponent,
    PipelineStreamingComponent,
    PipelineInferencingComponent,
    PipelineRulesComponent,
    PipelineDataSourceComponent,
    PipelineDataStoreComponent,
    PipelineDataPipeComponent,
    PipelineConfigComponent,
    IgeModelsComponent
  ],
  imports: [
    AppRoutingModule,
    TcCoreLibModule.forRoot(tcCoreConfig),
    TcFormsLibModule,
    TcLiveappsLibModule.forRoot(),
    FlexLayoutModule,
    BrowserModule,
    BrowserAnimationsModule,
    MatIconModule,
    FormsModule,
    ChartsModule,
    Ng2GoogleChartsModule,
    MaterialModule,
    ReteEditorModule,
    ReactiveFormsModule,
    SpotfireViewerModule,
    HttpClientModule,
    NgxHeatmapModule
  ],
  providers: [
    LogService,
    DatePipe,
    { provide: GraphService, useClass: DgraphService },
    // for proxied API calls
    // { provide: HTTP_INTERCEPTORS, useClass: ProxyInterceptor, multi: true },

    // for using oAuth
    // { provide: HTTP_INTERCEPTORS, useClass: OAuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(public sessionRefreshService: SessionRefreshService, public tcConfigService: TcCoreConfigService, private credentialsService: CredentialsService) {
    // note: if oauth in use then no need since key will be refreshed in local storage by session manager app
    if (!credentialsService.isOauth()) {
      // setup cookie refresh for every 10 minutes
      const usingProxy = (this.tcConfigService.getConfig().proxy_url && this.tcConfigService.getConfig().proxy_url !== '') ? true : false;
      this.sessionRefreshService.scheduleCookieRefresh(600000, usingProxy);
    }
  }
}

