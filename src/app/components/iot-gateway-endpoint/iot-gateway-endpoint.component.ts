import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-iot-gateway-endpoint',
  templateUrl: './iot-gateway-endpoint.component.html',
  styleUrls: ['./iot-gateway-endpoint.component.css']
})
export class IotGatewayEndpointComponent implements OnInit {

  gatewayId = "";

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.gatewayId = this.route.snapshot.paramMap.get('gatewayId');
  }

}
