import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { GraphService } from '../../services/graph/graph.service';
import { Device, Gateway } from '../../shared/models/iot.model';
import { EdgeService } from '../../services/edge/edge.service';
import { BreadcrumbsService } from '../../services/breadcrumbs/breadcrumbs.service';

@Component({
  selector: 'app-iot-gateway-details',
  templateUrl: './iot-gateway-details.component.html',
  styleUrls: ['./iot-gateway-details.component.css']
})

export class IotGatewayDetailsComponent implements OnInit {
  deviceList: Device[] = [];
  devicesDataSource = new MatTableDataSource<Device>();
  gatewayId: string = '';
  gateway: Gateway;

  constructor(private graphService: GraphService,
    private edgeService: EdgeService,
    private route: ActivatedRoute,
    private breadcrumbs: BreadcrumbsService
  ) { }

  ngOnInit(): void {
    // load devices
    if (this.route.snapshot.paramMap.get('gatewayId')) {
      this.gatewayId = this.route.snapshot.paramMap.get('gatewayId');
      this.getGatewayAndDevices(this.gatewayId);
    }
  }

  public getGatewayAndDevices(gatewayId: string) {
    this.graphService.getGateway(gatewayId)
      .subscribe(res => {
        this.gateway = res[0] as Gateway;
        // Get Devices to be used for filtering
        this.getDevices(this.gateway);
      })
  }

  public getDevices(gateway: Gateway) {
    this.edgeService.getDevices(gateway)
      .subscribe(res => {
        this.devicesDataSource.data = res as Device[];
      })
  }
}
