import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { Device, Resource, TSReading } from 'src/app/shared/models/iot.model';
import { GraphService } from '../../../services/graph/graph.service';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-iot-gateway-text',
  templateUrl: './iot-gateway-text.component.html',
  styleUrls: ['./iot-gateway-text.component.css']
})
export class IotGatewayTextComponent implements OnInit, OnDestroy, AfterViewInit {
  device: Device = new Device;
  instrument: Resource = new Resource;
  subscriptions: Subscription[] = []
  displayedColumns = ['created', 'value']
  dateFormat = 'yyyy-MM-dd HH:mm:ss';
  dataSource: MatTableDataSource<TSReading> = new MatTableDataSource<TSReading>();
  @ViewChild(MatSort)
  sort: MatSort = new MatSort;

  constructor(private graphService: GraphService) { }


  ngOnInit(): void {
    this.getReadings();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  public getReadings(): void {
    this.subscriptions.push(this.graphService.getReadings(this.device.name, this.instrument.name, 300)
      .subscribe(res => {

        // Check if values need to be decoded.  _Inferred values are encoded
        if (this.instrument.name.includes("_Inferred")) {
          for (var reading of res as TSReading[]) {
            reading.value = atob(reading.value);
          }
        }
      
        this.dataSource.data = res as TSReading[];
        
      }));
  }

}
