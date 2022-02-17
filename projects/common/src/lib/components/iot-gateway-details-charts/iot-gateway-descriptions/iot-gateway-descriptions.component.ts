import { Component, Input } from '@angular/core';
import { Device, Resource } from '../../../models/iot.model';

@Component({
    selector: 'app-common-iot-gateway-descriptions',
    templateUrl: './iot-gateway-descriptions.component.html',
    styleUrls: ['./iot-gateway-descriptions.component.css']
})
export class CommonIotGatewayDescriptionsComponent {
  @Input() device: Device;
  @Input() instrument: Resource;

  constructor() { }

}
