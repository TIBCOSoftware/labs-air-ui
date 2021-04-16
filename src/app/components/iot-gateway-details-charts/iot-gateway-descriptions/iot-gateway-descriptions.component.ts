import { Component, Input, OnInit } from '@angular/core';
import { Device, Resource } from 'src/app/shared/models/iot.model';

@Component({
  selector: 'app-iot-gateway-descriptions',
  templateUrl: './iot-gateway-descriptions.component.html',
  styleUrls: ['./iot-gateway-descriptions.component.css']
})
export class IotGatewayDescriptionsComponent implements OnInit {
  @Input() device: Device;
  @Input() instrument: Resource;
  
  constructor() { }

  ngOnInit(): void {
  }

}
