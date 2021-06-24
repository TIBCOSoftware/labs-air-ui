import { NgModule } from '@angular/core';
import { HttpClientModule } from "@angular/common/http";
import { BrowserModule } from '@angular/platform-browser';
import { MaterialModule } from './material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { NgxHeatmapModule } from 'ngx-heatmap';
import { ChartsModule } from 'ng2-charts';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { StarterAppComponent } from './routes/starter-app/starter-app.component';
import { SplashComponent } from './routes/splash/splash.component';

import { HomeComponent } from './routes/home/home.component';
import { IotHomeCockpitComponent } from './components/iot-home-cockpit/iot-home-cockpit.component';
import { IotGatewayComponent } from './components/iot-gateway/iot-gateway.component';
import { IotGatewayDetailsComponent, SensorDirective } from './components/iot-gateway-details/iot-gateway-details.component';
import { IotGatewayOverviewComponent } from './components/iot-gateway-details-charts/iot-gateway-overview/iot-gateway-overview.component';
import { IotGatewayTimeSeriesComponent } from './components/iot-gateway-details-charts/iot-gateway-time-series/iot-gateway-time-series.component';
import { IotGatewayLocationComponent } from './components/iot-gateway-details-charts/iot-gateway-location/iot-gateway-location.component';
import { IotGatewayXyzValueComponent } from './components/iot-gateway-details-charts/iot-gateway-xyz-value/iot-gateway-xyz-value.component';
import { IotGatewayImageComponent } from './components/iot-gateway-details-charts/iot-gateway-image/iot-gateway-image.component';
import { IotGatewayMapComponent } from './components/iot-gateway-details-charts/iot-gateway-map/iot-gateway-map.component';
import { IotGatewayDiscreteValueComponent } from './components/iot-gateway-details-charts/iot-gateway-discrete-value/iot-gateway-discrete-value.component';
import { IotGatewayDescriptionsComponent } from './components/iot-gateway-details-charts/iot-gateway-descriptions/iot-gateway-descriptions.component';

import { NavBarComponent } from './components/nav-bar/nav-bar.component';

import { GraphService } from './services/graph/graph.service';
import { DgraphService } from './services/graph/dgraph.service';
import { Ng2GoogleChartsModule } from 'ng2-google-charts';
import { IotGatewayTextComponent } from './components/iot-gateway-details-charts/iot-gateway-text/iot-gateway-text.component';
import { MaporamaComponent } from './components/maporama/maporama.component';
import { IotGatewayEndpointComponent } from './components/iot-gateway-endpoint/iot-gateway-endpoint.component';
import { IgeModelsComponent } from './components/iot-gateway-endpoint/ige-models/ige-models.component';
import { IgeDataStoresComponent } from './components/iot-gateway-endpoint/ige-data-stores/ige-data-stores.component';
import { IgeProtocolsComponent } from './components/iot-gateway-endpoint/ige-protocols/ige-protocols.component';
import { IotPipelineComponent } from './components/iot-pipeline/iot-pipeline.component';
import { ReteEditorModule } from './components/rete/rete.module';
import { PipelineConfigComponent } from './components/iot-pipeline/pipeline-config/pipeline-config.component';
import { PipelineDataPublisherComponent } from './components/iot-pipeline/pipeline-data-publisher/pipeline-data-publisher.component';
import { PipelineDataStoreComponent } from './components/iot-pipeline/pipeline-data-store/pipeline-data-store.component';
import { PipelineDataSubscriberComponent } from './components/iot-pipeline/pipeline-data-subscriber/pipeline-data-subscriber.component';
import { PipelineEditorComponent } from './components/iot-pipeline/pipeline-editor/pipeline-editor.component';
import { PipelineFilteringComponent } from './components/iot-pipeline/pipeline-filtering/pipeline-filtering.component';
import { PipelineFlogoFlowComponent } from './components/iot-pipeline/pipeline-flogo-flow/pipeline-flogo-flow.component';
import { PipelineInferencingComponent } from './components/iot-pipeline/pipeline-inferencing/pipeline-inferencing.component';
import { PipelineRestServiceComponent } from './components/iot-pipeline/pipeline-rest-service/pipeline-rest-service.component';
import { PipelineRuleExpressionComponent } from './components/iot-pipeline/pipeline-rule-expression/pipeline-rule-expression.component';
import { PipelineRulesComponent } from './components/iot-pipeline/pipeline-rules/pipeline-rules.component';
import { PipelineStreamingComponent } from './components/iot-pipeline/pipeline-streaming/pipeline-streaming.component';


@NgModule({
  declarations: [
    AppComponent,
    StarterAppComponent,
    SplashComponent,
    HomeComponent,
    IotHomeCockpitComponent,
    IotGatewayComponent,
    NavBarComponent,
    IotGatewayDetailsComponent,
    SensorDirective,
    IotGatewayDescriptionsComponent,
    IotGatewayOverviewComponent,
    IotGatewayTimeSeriesComponent,
    IotGatewayLocationComponent,
    IotGatewayXyzValueComponent,
    IotGatewayImageComponent,
    IotGatewayMapComponent,
    IotGatewayDiscreteValueComponent,
    IotGatewayTextComponent,
    MaporamaComponent,
    IotGatewayEndpointComponent,
    IgeModelsComponent,
    IgeDataStoresComponent,
    IgeProtocolsComponent,
    IotPipelineComponent,
    PipelineConfigComponent,
    PipelineDataPublisherComponent,
    PipelineDataStoreComponent,
    PipelineDataSubscriberComponent,
    PipelineEditorComponent,
    PipelineFilteringComponent,
    PipelineFlogoFlowComponent,
    PipelineInferencingComponent,
    PipelineRestServiceComponent,
    PipelineRuleExpressionComponent,
    PipelineRulesComponent,
    PipelineStreamingComponent

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
    ReteEditorModule,
    ChartsModule
  ],
  providers: [
    DatePipe,
    { provide: GraphService, useClass: DgraphService }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
