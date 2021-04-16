import { Component, OnInit } from '@angular/core';
import { Device, Resource } from 'src/app/shared/models/iot.model';

@Component({
  selector: 'app-iot-gateway-overview',
  templateUrl: './iot-gateway-overview.component.html',
  styleUrls: ['./iot-gateway-overview.component.css']
})
export class IotGatewayOverviewComponent implements OnInit {
  device: Device;
  instrument: Resource;

  constructor() { }

  ngOnInit(): void {
  }

}
