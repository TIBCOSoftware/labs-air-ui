import { Component, OnInit } from '@angular/core';
import { Device, Resource, TSReading } from 'src/app/shared/models/iot.model';
import { GoogleChartInterface } from 'ng2-google-charts/google-charts-interfaces';
import { Subscription } from 'rxjs';
import { GraphService } from '../../../services/graph/graph.service';

@Component({
  selector: 'app-iot-gateway-discrete-value',
  templateUrl: './iot-gateway-discrete-value.component.html',
  styleUrls: ['./iot-gateway-discrete-value.component.css']
})
export class IotGatewayDiscreteValueComponent implements OnInit {
  device: Device;
  instrument: Resource;
  resourceReadings = [];
  subscriptions: Subscription[] = []
  numReadings = 40;

  constructor(private graphService: GraphService) { }

  ngOnInit(): void {
    this.getReadings();
  }

  public timelineChartData: GoogleChartInterface = {
    chartType: 'Timeline',
    dataTable: [
      ['Name', 'From', 'To'],
      ['Washington', new Date(1789, 3, 30), new Date(1797, 2, 4)],
      ['Adams', new Date(1797, 2, 4), new Date(1801, 2, 4)],
      ['Jefferson', new Date(1801, 2, 4), new Date(1809, 2, 4)]
    ],
    options: {
      height: 350
    }
  }
  public getReadings() {
    this.graphService.getReadings(this.device.name, this.instrument.name, this.numReadings)
      .subscribe(res => {
        this.resourceReadings = res as TSReading[];
        this.setTimelineDataSet(this.device.name);
      })
  }

  setTimelineDataSet(deviceName) {
    let ccComponent = this.timelineChartData.component;


    this.timelineChartData.dataTable = [];
    this.timelineChartData.dataTable.push(['Name', 'From', 'To']);
    let numReadings = this.resourceReadings.length;


    if (numReadings > 1) {
      this.timelineChartData.dataTable.push(["Power Available",
        new Date(this.resourceReadings[0].created), new Date(this.resourceReadings[0].created)]);
      this.timelineChartData.dataTable.push(["Ready To Charge",
        new Date(this.resourceReadings[0].created), new Date(this.resourceReadings[0].created)]);
      this.timelineChartData.dataTable.push(["Charging",
        new Date(this.resourceReadings[0].created), new Date(this.resourceReadings[0].created)]);
      this.timelineChartData.dataTable.push(["Reduced Rate Charge",
        new Date(this.resourceReadings[0].created), new Date(this.resourceReadings[0].created)]);
      this.timelineChartData.dataTable.push(["Pause",
        new Date(this.resourceReadings[0].created), new Date(this.resourceReadings[0].created)]);
      this.timelineChartData.dataTable.push(["Fault",
        new Date(this.resourceReadings[0].created), new Date(this.resourceReadings[0].created)]);

      let i = 1;
      for (; i < numReadings; i++) {
        this.timelineChartData.dataTable.push([this.resourceReadings[i - 1].value,
        new Date(this.resourceReadings[i - 1].created), new Date(this.resourceReadings[i].created)]);
      }
      this.timelineChartData.dataTable.push([this.resourceReadings[i - 1].value,
      new Date(this.resourceReadings[i - 1].created), new Date(Date.now())]);
    }


    // this.timelineChartData.dataTable.push(['Name', 'From', 'To']);
    // this.timelineChartData.dataTable.push([ 'Juan', new Date(1789, 3, 30), new Date(1797, 2, 4) ]);
    // this.timelineChartData.dataTable.push([ 'Peter',      new Date(1797, 2, 4),  new Date(1801, 2, 4) ]);

    ccComponent.draw();
  }

}
