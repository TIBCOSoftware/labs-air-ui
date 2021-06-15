import { SplashComponent } from '../../routes/splash/splash.component';
import { HomeComponent } from '../../routes/home/home.component';
import { IotGatewayComponent } from 'src/app/components/iot-gateway/iot-gateway.component';
import { IotGatewayDetailsComponent } from 'src/app/components/iot-gateway-details/iot-gateway-details.component';

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
        path: 'device-details/:gatewayId',
        component: IotGatewayDetailsComponent,
        data: { breadcrumb: ['Gateways','Devices']}
      }
    ]
  },
  {
    path: 'splash',
    component: SplashComponent
  }
];