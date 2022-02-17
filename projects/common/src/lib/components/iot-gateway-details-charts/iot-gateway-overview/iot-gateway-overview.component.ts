import { Component } from '@angular/core';
import { Device, Resource } from '../../../models/iot.model';

@Component({
    selector: 'app-common-iot-gateway-overview',
    templateUrl: './iot-gateway-overview.component.html',
    styleUrls: ['./iot-gateway-overview.component.css']
})
export class CommonIotGatewayOverviewComponent {
  device: Device;
  instrument: Resource;

  constructor() { }

}
