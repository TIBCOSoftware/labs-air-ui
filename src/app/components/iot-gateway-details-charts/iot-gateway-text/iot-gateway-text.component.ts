import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Device, Resource, TSReading } from 'src/app/shared/models/iot.model';
import { GraphService } from '../../../services/graph/graph.service';

@Component({
  selector: 'app-iot-gateway-text',
  templateUrl: './iot-gateway-text.component.html',
  styleUrls: ['./iot-gateway-text.component.css']
})
export class IotGatewayTextComponent implements OnInit {
  device: Device;
  instrument: Resource;
  subscriptions: Subscription[] = []
  public resourceReadings = [];
  constructor(private graphService: GraphService) { }
  displayedColumns = ['created', 'value']
  dateFormat = 'yyyy-MM-dd HH:mm:ss'

  ngOnInit(): void {
    this.getReadings();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  public getReadings() {
    this.subscriptions.push(this.graphService.getReadings(this.device.name, this.instrument.name, 300)
      .subscribe(res => {
        this.resourceReadings = res as TSReading[];
      }));
  }

}
