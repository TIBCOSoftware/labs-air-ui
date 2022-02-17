import { SplashComponent } from '../../routes/splash/splash.component';
import { HomeComponent } from '../../routes/home/home.component';
import {IotGatewayEndpointComponent} from '../../components/iot-gateway-endpoint/iot-gateway-endpoint.component';
import { CommonIotGatewayComponent } from 'common';
import { CommonIotGatewayDetailsComponent } from 'common';
import { CommonIotPipelineComponent } from 'common';
import { CommonIotDataPipelineComponent } from 'common';
import { CommonIotEdgeDataPipelineComponent } from 'common';
import { IotGatewayDashboardComponent } from '../../components/iot-gateway-dashboard/iot-gateway-dashboard.component';
import { ActivatedRouteSnapshot, NavigationEnd, Router, ActivatedRoute} from '@angular/router';
import { Params } from '@angular/router';
import { Observable } from 'rxjs';
import { CommonIotInfraDeployerComponent } from 'common';
import { CommonIotNotificationsComponent } from 'common';
import { CommonIotStoreSimulatorComponent } from 'common';
import { IotDashboardComponent } from '../../components/iot-dashboard/iot-dashboard.component';
import { CommonIotTextileSimulatorComponent } from 'common';

export const HOME_ROUTE = 'splash';
let router:Router;
let params: Observable<Params>;
let snapshot: ActivatedRouteSnapshot;
let route: ActivatedRoute;
export const STARTER_APP_ROUTES=
[
    {
        path: 'home',
        component: HomeComponent,
        children: [
            {
                path: 'gateway',
                component: CommonIotGatewayComponent,
                data: { breadcrumb: ['Gateways'] }
            },
            {
                path: 'iotdashboard',
                component: IotDashboardComponent,
                data: { breadcrumb: ['Gateways'] }
            },
            {
                path: 'gatewayendpoint/:gatewayId',
                component: IotGatewayEndpointComponent,
                data: {breadcrumb: ['Gateways', 'Endpoints', 'Endpoints']}
            },
            {
                path: 'device-details/:gatewayId',
                component: CommonIotGatewayDetailsComponent,
                data: { breadcrumb: ['Gateways','Devices', 'Devices']}
            },
            {
                path: 'pipeline/:gatewayId',
                component: CommonIotPipelineComponent,
                data: {breadcrumb: ['Gateways', 'Pipelines', 'Pipelines']}
            },
            {
                path: 'datapipeline/:gatewayId',
                component: CommonIotDataPipelineComponent,
                data: {breadcrumb: ['Gateways']}
            },
            {
                path: 'gatewaydashboard',
                component: IotGatewayDashboardComponent,
                data: {breadcrumb: ['Gateways']}
            },
            {
                path: 'infradeployer',
                component: CommonIotInfraDeployerComponent,
                data: {breadcrumb: ['Gateways']}
            },
            {
                path: 'notifications',
                component: CommonIotNotificationsComponent,
                data: {breadcrumb: ['Gateways']}
            },
            {
                path: 'store-simulator',
                component: CommonIotStoreSimulatorComponent,
                data: {breadcrumb: ['Store Simulator']}
            },
            {
                path: 'textile-simulator',
                component: CommonIotTextileSimulatorComponent,
                data: {breadcrumb: ['Textile Simulator']}
            },
            {
                path: 'edgedatapipeline/:gatewayId',
                component: CommonIotEdgeDataPipelineComponent,
                data: {breadcrumb: ['Gateways']}
            }
      
      
        ]
    },
    {
        path: 'splash',
        component: SplashComponent
    }
];