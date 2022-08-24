import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { Device, Resource } from '../../../models/iot.model';
import { GraphService } from '@TIBCOSoftware/labs-air-graph-client';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Reading } from '@TIBCOSoftware/labs-air-graph-client';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-common-iot-gateway-text',
    templateUrl: './iot-gateway-text.component.html',
    styleUrls: ['./iot-gateway-text.component.css']
})
export class CommonIotGatewayTextComponent implements OnInit, OnDestroy, AfterViewInit {
  device: Device;
  instrument: Resource;
  subscriptions: Subscription[] = []
  displayedColumns = ['created', 'value']
  dateFormat = 'yyyy-MM-dd HH:mm:ss';
  dataSource: MatTableDataSource<Reading> = new MatTableDataSource<Reading>();
  @ViewChild(MatSort) sort: MatSort;
  gatewayId: string;

  constructor(
    private graphService: GraphService,
    private route: ActivatedRoute) { }


  ngOnInit(): void {
    if (this.route.snapshot.paramMap.get('gatewayId')) {
        this.gatewayId = this.route.snapshot.paramMap.get('gatewayId');
    }
      this.getReadings();
  }

  ngOnDestroy(): void {
      this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngAfterViewInit(): void {
      this.dataSource.sort = this.sort;
  }

  public getReadings(): void {
      this.subscriptions.push(this.graphService.getReadings(this.gatewayId, this.device.name, this.instrument.name, 300)
          .subscribe(res => {

              // Check if values need to be decoded.  _Inferred values are encoded
              if (this.instrument.name.includes('_Inferred')) {
                  for (const reading of res as Reading[]) {
                      reading.value = atob(reading.value);
                  }
              }

              this.dataSource.data = res as Reading[];

          }));
  }

}
