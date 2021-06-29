import { SplashComponent } from '../../routes/splash/splash.component';
import { HomeComponent } from '../../routes/home/home.component';
import {IotGatewayEndpointComponent} from '../../components/iot-gateway-endpoint/iot-gateway-endpoint.component';
import { IotGatewayComponent } from 'src/app/components/iot-gateway/iot-gateway.component';
import { IotGatewayDetailsComponent } from 'src/app/components/iot-gateway-details/iot-gateway-details.component';
import { IotPipelineComponent } from 'src/app/components/iot-pipeline/iot-pipeline.component';
import { IotDataPipelineComponent } from 'src/app/components/iot-data-pipeline/iot-data-pipeline.component';
import { IotEdgeDataPipelineComponent } from 'src/app/components/iot-edge-data-pipeline/iot-edge-data-pipeline.component';
import { IotGatewayDashboardComponent } from 'src/app/components/iot-gateway-dashboard/iot-gateway-dashboard.component';

export const HOME_ROUTE = 'splash';

export const STARTER_APP_ROUTES =
[
  {
    path: 'home',
    component: HomeComponent,
    children: [
      {
        path: 'gateway',
        component: IotGatewayComponent,
        data: { breadcrumb: ['Gateways'] }
      },
      {
        path: 'gatewayendpoint/:gatewayId',
        component: IotGatewayEndpointComponent
        },
      {
        path: 'device-details/:gatewayId',
        component: IotGatewayDetailsComponent,
        data: { breadcrumb: ['Gateways','Devices']}
      },
      {
        path: 'pipeline/:gatewayId',
        component: IotPipelineComponent
      },
      {
        path: 'datapipeline/:gatewayId',
        component: IotDataPipelineComponent
      },
      {
        path: 'gatewaydashboard',
        component: IotGatewayDashboardComponent
      },
      {
        path: 'edgedatapipeline/:gatewayId',
        component: IotEdgeDataPipelineComponent
      }
      
      
    ]
  },
  {
    path: 'splash',
    component: SplashComponent
  }
];