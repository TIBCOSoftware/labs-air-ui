import { NgModule,APP_INITIALIZER } from '@angular/core';
import { CommonIotGatewayComponent } from './components/iot-gateway/iot-gateway.component';
import { CommonIotGatewayDetailsComponent, SensorDirective } from './components/iot-gateway-details/iot-gateway-details.component'
import { CommonIotGatewayOverviewComponent } from './components/iot-gateway-details-charts/iot-gateway-overview/iot-gateway-overview.component';
import { CommonIotGatewayTimeSeriesComponent } from './components/iot-gateway-details-charts/iot-gateway-time-series/iot-gateway-time-series.component';
import { CommonIotGatewayLocationComponent } from './components/iot-gateway-details-charts/iot-gateway-location/iot-gateway-location.component';
import { CommonIotGatewayXyzValueComponent } from './components/iot-gateway-details-charts/iot-gateway-xyz-value/iot-gateway-xyz-value.component';
import { CommonIotGatewayImageComponent } from './components/iot-gateway-details-charts/iot-gateway-image/iot-gateway-image.component';
// import { CommonIotGatewayVideoStreamComponent } from './components/iot-gateway-details-charts/iot-gateway-video-stream/iot-gateway-video-stream.component';
import { CommonIotGatewayObjectComponent } from './components/iot-gateway-details-charts/iot-gateway-object/iot-gateway-object.component';
import { CommonIotGatewayMapComponent } from './components/iot-gateway-details-charts/iot-gateway-map/iot-gateway-map.component';
import { CommonIotGatewayDiscreteValueComponent } from './components/iot-gateway-details-charts/iot-gateway-discrete-value/iot-gateway-discrete-value.component';
import { CommonIotGatewayDescriptionsComponent } from './components/iot-gateway-details-charts/iot-gateway-descriptions/iot-gateway-descriptions.component';
import { CommonIotGatewayTextComponent } from './components/iot-gateway-details-charts/iot-gateway-text/iot-gateway-text.component'
import { CommonMaporamaComponent } from './components/maporama/maporama.component';
import { CommonIotPipelineComponent } from './components/iot-pipeline/iot-pipeline.component';
import { PipelineConfigComponent } from './components/iot-pipeline/pipeline-config/pipeline-config.component';
import { PipelineDataPublisherComponent } from './components/iot-pipeline/pipeline-data-publisher/pipeline-data-publisher.component';
import { PipelineDataStoreComponent } from './components/iot-pipeline/pipeline-data-store/pipeline-data-store.component';
import { PipelineDataSubscriberComponent } from './components/iot-pipeline/pipeline-data-subscriber/pipeline-data-subscriber.component';
import { PipelineFilteringComponent } from './components/iot-pipeline/pipeline-filtering/pipeline-filtering.component';
import { PipelineFlogoFlowComponent } from './components/iot-pipeline/pipeline-flogo-flow/pipeline-flogo-flow.component';
import { PipelineInferencingComponent } from './components/iot-pipeline/pipeline-inferencing/pipeline-inferencing.component';
import { PipelineRestServiceComponent } from './components/iot-pipeline/pipeline-rest-service/pipeline-rest-service.component';
import { PipelineRuleExpressionComponent } from './components/iot-pipeline/pipeline-rule-expression/pipeline-rule-expression.component';
import { PipelineRuleTextMatchingComponent } from './components/iot-pipeline/pipeline-rule-text-matching/pipeline-rule-text-matching.component';
import { PipelineRulesComponent } from './components/iot-pipeline/pipeline-rules/pipeline-rules.component';
import { PipelineStreamingComponent } from './components/iot-pipeline/pipeline-streaming/pipeline-streaming.component';
import { SingleValueDialogComponent } from './components/iot-pipeline/pipeline-dialog/single-value-dialog.component';
import { InfraDeployerComponent } from './components/iot-infra-deployer/infra-deployer/infra-deployer.component';
import { InfraRegistrationComponent } from './components/iot-infra-deployer/infra-registration/infra-registration.component';
import { CommonIotInfraDeployerComponent } from './components/iot-infra-deployer/iot-infra-deployer.component'
import { CommonIotNotificationsComponent } from './components/iot-notifications/iot-notifications.component'
import { CommonIotStoreSimulatorComponent } from './components/iot-simulator/iot-store-simulator/iot-store-simulator.component';
import { CommonIotTextileSimulatorComponent } from './components/iot-simulator/iot-textile-simulator/iot-textile-simulator.component';
import { PipelineRestBroadcastComponent } from './components/iot-pipeline/pipeline-rest-broadcast/pipeline-rest-broadcast.component';
import { CommonIotGatewayEndpointComponent } from './components/iot-gateway-endpoint/iot-gateway-endpoint.component';
import { IgeDataStoresComponent } from './components/iot-gateway-endpoint/ige-data-stores/ige-data-stores.component';
import { IgeModelsComponent } from './components/iot-gateway-endpoint/ige-models/ige-models.component'
import { IgeProtocolsComponent } from './components/iot-gateway-endpoint/ige-protocols/ige-protocols.component'
import { PipelinePythonComponent } from './components/iot-pipeline/pipeline-python/pipeline-python.component';
import { IgeResourcesComponent } from './components/iot-gateway-endpoint/ige-resources/ige-resources.component';

// modules
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material.module';
import { Ng2GoogleChartsModule } from 'ng2-google-charts';
import { FormsModule } from '@angular/forms'
import { NgChartsModule } from 'ng2-charts';
import { ReactiveFormsModule } from '@angular/forms';
import { ReteEditorModule } from './components/rete/rete.module';
import { NgxHeatmapModule } from 'ngx-heatmap'
import { HighlightModule, HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';

//services
import { AppConfigService } from './services/config/app-config.service';
import { EdgeService } from './services/edge/edge.service';
import { DatastoreService } from './services/datastore/datastore.service';
import { GraphService } from '@TIBCOSoftware/labs-air-graph-client'
import { DatePipe } from '@angular/common';
import { RestHeadersComponent } from './components/iot-pipeline/rest-headers/rest-headers.component';
import { PipelineRequestReplyComponent } from './components/iot-pipeline/pipeline-request-reply/pipeline-request-reply.component';
import { PipelinePythonPipeComponent } from './components/iot-pipeline/pipline-python-pipe/pipeline-python-pipe.component';

const appInitializerFn = (appConfig: AppConfigService) => {
  return () => {
      return appConfig.loadAppConfig();
  };
};

@NgModule({
  declarations: [
    CommonIotGatewayComponent,
    CommonIotGatewayDetailsComponent,
    CommonIotGatewayOverviewComponent,
    CommonIotGatewayTimeSeriesComponent,
    CommonIotGatewayLocationComponent,
    CommonIotGatewayXyzValueComponent,
    CommonIotGatewayImageComponent,
    // CommonIotGatewayVideoStreamComponent,
    CommonIotGatewayObjectComponent,
    CommonIotGatewayMapComponent,
    CommonIotGatewayDiscreteValueComponent,
    CommonIotGatewayDescriptionsComponent,
    CommonIotGatewayTextComponent,
    CommonMaporamaComponent,
    SensorDirective,
    CommonMaporamaComponent,
    CommonIotPipelineComponent,
    PipelineConfigComponent,
    PipelineDataPublisherComponent,
    PipelineDataStoreComponent,
    PipelineDataSubscriberComponent,
    PipelineFilteringComponent,
    PipelineFlogoFlowComponent,
    PipelineInferencingComponent,
    PipelineRestServiceComponent,
    PipelineRuleExpressionComponent,
    PipelineRuleTextMatchingComponent,
    PipelineRulesComponent,
    PipelineStreamingComponent,
    SingleValueDialogComponent,
    InfraDeployerComponent,
    InfraRegistrationComponent,
    CommonIotInfraDeployerComponent,
    CommonIotNotificationsComponent,
    CommonIotStoreSimulatorComponent,
    CommonIotTextileSimulatorComponent,
    PipelineRestBroadcastComponent,
    RestHeadersComponent,
    CommonIotGatewayEndpointComponent,
    IgeDataStoresComponent,
    IgeModelsComponent,
    IgeProtocolsComponent,
    PipelineRequestReplyComponent,
    PipelinePythonComponent,
    IgeResourcesComponent,
    PipelinePythonPipeComponent
  ],
  imports: [
    MaterialModule,
    CommonModule,
    RouterModule,
    BrowserAnimationsModule,
    Ng2GoogleChartsModule,
    FormsModule,
    NgChartsModule,
    ReactiveFormsModule,
    ReteEditorModule,
    NgxHeatmapModule,
    HighlightModule
  ],
  exports: [
    CommonIotGatewayComponent,
    CommonIotGatewayDetailsComponent,
    CommonIotGatewayOverviewComponent,
    CommonIotInfraDeployerComponent,
    CommonIotNotificationsComponent,
  ],
  providers: [
    AppConfigService,
    {
        provide: APP_INITIALIZER,
        useFactory: appInitializerFn,
        multi: true,
        deps: [AppConfigService],
    },
    EdgeService,
    DatastoreService,
    DatePipe,
    {
      provide: HIGHLIGHT_OPTIONS,
      useValue: {
        coreLibraryLoader: () => import('highlight.js/lib/core'),
        lineNumbersLoader: () => import('highlightjs-line-numbers.js'),
        languages: {
          python: () => import('highlight.js/lib/languages/python'),
        },
        // themePath: 'assets/highlight/default.css'
      }
    },
    DatePipe
  ]
})
export class CommonLibraryModule { }
