import { SplashComponent } from '../../routes/splash/splash.component';
import { HomeComponent } from '../../routes/home/home.component';
import { CommonIotGatewayEndpointComponent } from 'common';
import { CommonIotGatewayComponent } from 'common';
import { CommonIotGatewayDetailsComponent } from 'common';
import { CommonIotPipelineComponent } from 'common';
import { IotGatewayDashboardComponent } from '../../components/iot-gateway-dashboard/iot-gateway-dashboard.component';
import { CommonIotInfraDeployerComponent } from 'common';
import { CommonIotNotificationsComponent } from 'common';
import { CommonIotStoreSimulatorComponent } from 'common';
import { IotDashboardComponent } from '../../components/iot-dashboard/iot-dashboard.component';
import { CommonIotTextileSimulatorComponent } from 'common';

export const HOME_ROUTE = 'splash';

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
                component: CommonIotGatewayEndpointComponent,
                data: {breadcrumb: ['Gateways', 'Endpoints', 'Endpoints']}
            },
            {
                path: 'device-details/:gatewayId',
                component: CommonIotGatewayDetailsComponent,
                data: { breadcrumb: ['Gateways', 'Devices', 'Devices']}
            },
            {
                path: 'pipeline/:gatewayId',
                component: CommonIotPipelineComponent,
                data: {breadcrumb: ['Gateways', 'Pipelines', 'Pipelines']}
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
            }
      
      
        ]
    },
    {
        path: 'splash',
        component: SplashComponent
    }
];