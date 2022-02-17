import { NgModule,APP_INITIALIZER } from '@angular/core';
import { CommonIotGatewayComponent } from './components/iot-gateway/iot-gateway.component';
import { CommonIotGatewayDetailsComponent, SensorDirective } from './components/iot-gateway-details/iot-gateway-details.component'
import { CommonIotGatewayOverviewComponent } from './components/iot-gateway-details-charts/iot-gateway-overview/iot-gateway-overview.component';
import { CommonIotGatewayTimeSeriesComponent } from './components/iot-gateway-details-charts/iot-gateway-time-series/iot-gateway-time-series.component';
import { CommonIotGatewayLocationComponent } from './components/iot-gateway-details-charts/iot-gateway-location/iot-gateway-location.component';
import { CommonIotGatewayXyzValueComponent } from './components/iot-gateway-details-charts/iot-gateway-xyz-value/iot-gateway-xyz-value.component';
import { CommonIotGatewayImageComponent } from './components/iot-gateway-details-charts/iot-gateway-image/iot-gateway-image.component';
import { CommonIotGatewayMapComponent } from './components/iot-gateway-details-charts/iot-gateway-map/iot-gateway-map.component';
import { CommonIotGatewayDiscreteValueComponent } from './components/iot-gateway-details-charts/iot-gateway-discrete-value/iot-gateway-discrete-value.component';
import { CommonIotGatewayDescriptionsComponent } from './components/iot-gateway-details-charts/iot-gateway-descriptions/iot-gateway-descriptions.component';
import { CommonIotGatewayTextComponent } from './components/iot-gateway-details-charts/iot-gateway-text/iot-gateway-text.component'
import { CommonMaporamaComponent } from './components/maporama/maporama.component';
import { CommonIotDataPipelineComponent } from './components/iot-data-pipeline/iot-data-pipeline.component'
import { DataFilteringComponent } from './components/iot-data-pipeline/data-filtering/data-filtering.component';
import { DataFilteringViewComponent } from './components/iot-data-pipeline/data-filtering-view/data-filtering-view.component';
import { DataStoresComponent } from './components/iot-data-pipeline/data-stores/data-stores.component';
import { DataStoresViewComponent } from './components/iot-data-pipeline/data-stores-view/data-stores-view.component';
import { DataStreamingComponent } from './components/iot-data-pipeline/data-streaming/data-streaming.component';
import { DataStreamingViewComponent } from './components/iot-data-pipeline/data-streaming-view/data-streaming-view.component';
import { ProtocolsComponent } from './components/iot-data-pipeline/protocols/protocols.component';
import { ProtocolsViewComponent } from './components/iot-data-pipeline/protocols-view/protocols-view.component';
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
import { PipelineRulesComponent } from './components/iot-pipeline/pipeline-rules/pipeline-rules.component';
import { PipelineStreamingComponent } from './components/iot-pipeline/pipeline-streaming/pipeline-streaming.component';
import { SingleValueDialogComponent } from './components/iot-pipeline/pipeline-dialog/single-value-dialog.component';
import { InfraDeployerComponent } from './components/iot-infra-deployer/infra-deployer/infra-deployer.component';
import { InfraRegistrationComponent } from './components/iot-infra-deployer/infra-registration/infra-registration.component';
import { CommonIotInfraDeployerComponent } from './components/iot-infra-deployer/iot-infra-deployer.component'
import { CommonIotNotificationsComponent } from './components/iot-notifications/iot-notifications.component'
import { CommonIotEdgeDataPipelineComponent } from './components/iot-edge-data-pipeline/iot-edge-data-pipeline.component'
import { FilteringComponent } from './components/iot-edge-data-pipeline/filtering/filtering.component'
import { InferencingComponent } from './components/iot-edge-data-pipeline/inferencing/inferencing.component'
import { RulesComponent } from './components/iot-edge-data-pipeline/rules/rules.component'
import { CommonIotStoreSimulatorComponent } from './components/iot-simulator/iot-store-simulator/iot-store-simulator.component';
import { CommonIotTextileSimulatorComponent } from './components/iot-simulator/iot-textile-simulator/iot-textile-simulator.component';

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

//services
import { AppConfigService } from './services/config/app-config.service';
import { EdgeService } from './services/edge/edge.service';
import { DgraphService } from './services/graph/dgraph.service';
import { DatastoreService } from './services/datastore/datastore.service';
import { GraphService } from './services/graph/graph.service'
import { DatePipe } from '@angular/common';

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
    CommonIotGatewayMapComponent,
    CommonIotGatewayDiscreteValueComponent,
    CommonIotGatewayDescriptionsComponent,
    CommonIotGatewayTextComponent,
    CommonMaporamaComponent,
    SensorDirective,
    CommonMaporamaComponent,
    DataFilteringComponent,
    DataFilteringViewComponent,
    DataStoresComponent,
    DataStoresViewComponent,
    DataStreamingComponent,
    DataStreamingViewComponent,
    ProtocolsComponent,
    ProtocolsViewComponent,
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
    PipelineRulesComponent,
    PipelineStreamingComponent,
    SingleValueDialogComponent,
    CommonIotDataPipelineComponent,
    InfraDeployerComponent,
    InfraRegistrationComponent,
    CommonIotInfraDeployerComponent,
    CommonIotNotificationsComponent,
    CommonIotEdgeDataPipelineComponent,
    FilteringComponent,
    InferencingComponent,
    RulesComponent,
    CommonIotStoreSimulatorComponent,
    CommonIotTextileSimulatorComponent
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
    NgxHeatmapModule
  ],
  exports: [
    CommonIotGatewayComponent,
    CommonIotGatewayDetailsComponent,
    CommonIotGatewayOverviewComponent,
    CommonIotInfraDeployerComponent,
    CommonIotNotificationsComponent,
    CommonIotEdgeDataPipelineComponent
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
    { provide: GraphService, useClass: DgraphService },
    DatePipe
  ]
})
export class CommonLibraryModule { }
