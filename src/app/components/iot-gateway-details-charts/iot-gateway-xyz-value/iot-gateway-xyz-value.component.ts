import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Device, Resource, TSReading } from 'src/app/shared/models/iot.model';
import { GraphService } from '../../../services/graph/graph.service';

@Component({
  selector: 'app-iot-gateway-xyz-value',
  templateUrl: './iot-gateway-xyz-value.component.html',
  styleUrls: ['./iot-gateway-xyz-value.component.css']
})
export class IotGatewayXyzValueComponent implements OnInit, OnDestroy {
  device: Device;
  instrument: Resource;
  subscriptions: Subscription[] = []
  resourceReadings = [];
  resourceInferredReadings = []
  numReadings = 1;
  public inferredXYZData = ""


  heatmapRefWidth = 45
  heatmapRefHeight = 27
  heatmapWidth = this.heatmapRefWidth * 20 + 20
  heatmapHeight = this.heatmapRefHeight * 20 + 20
  heatmapMaxDataPoints = 1000
  heatmapMinDataPoints = 0
  heatmapConfig = {
    radius: 1
  }
  heatmapData = {
    max: 5, data: []
  };

  constructor(private graphService: GraphService) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  public setXYZHeatmapDataSet() {

    var xyzData = [];

    var objstr = atob(this.resourceReadings[0].value)

    // console.log("Object str: ", objstr);

    var obj = JSON.parse(objstr);
    var max = 0;
    var min = 99999;
    var scaledVal = 0;
    var scaledDiex = 0;
    var scaledDiey = 0;
    var maxVal = 0;
    var minVal = 9999999;

    // console.log("Object json: ", obj);
    obj.readings.forEach(
      reading => {


        maxVal = Math.max(maxVal, reading.measurement);
        minVal = Math.min(minVal, reading.measurement);
      }
    );

    console.log("MAX Pre scaled value  MAX  MIN : ", maxVal, minVal)


    obj.readings.forEach(
      reading => {
        // var val = Math.floor(reading.measurement*1000000000);
        var val = reading.measurement;
        // if (reading.measurement > 0)
        //   val = Math.floor(reading.measurement*1000000000);
        if (reading.measurement < 0)
          val = 0;

        // console.log("Pre scaled value: ", val)

        // scaledVal = this.scaleValue(val, [0,+847], [0,this.heatmapMaxDataPoints]);
        scaledVal = this.scaleValue(val, [minVal, maxVal], [0, this.heatmapMaxDataPoints]);

        max = Math.max(max, scaledVal);

        scaledDiex = this.scaleValue(reading.diex, [0, this.heatmapRefWidth], [0, this.heatmapWidth]);
        scaledDiey = this.scaleValue(reading.diey, [0, this.heatmapRefHeight], [0, this.heatmapHeight]);

        // console.log("Reading: ", reading);
        xyzData.push({ x: Number(scaledDiex), y: Number(scaledDiey), value: scaledVal, radius: 20 });
      }
    );
    console.log("data transformed: ", xyzData);
    console.log("Max Min: ", max, min);
    this.heatmapData = {
      max: max, data: xyzData
    };
  }

  scaleValue(value, from, to) {
    var scale = (to[1] - to[0]) / (from[1] - from[0]);
    var capped = Math.min(from[1], Math.max(from[0], value)) - from[0];
    return ~~(capped * scale + to[0]);
  }

  getReadings() {
    this.graphService.getReadings(this.device.name, this.instrument.name, 300)
      .subscribe(res => {
        this.resourceReadings = res as TSReading[];
        this.getResourceInferredReadings(this.device.name, this.instrument.name + "_Inferred", this.numReadings, this.resourceReadings[0].created)
        this.setXYZHeatmapDataSet();
      })
  }

  getResourceInferredReadings(deviceName, resourceName, numReadings, ts) {
    this.graphService.getReadingsAt(deviceName, resourceName, ts)
    .subscribe(res => {
      this.resourceInferredReadings = res as TSReading[];
      this.inferredXYZData = ""
      this.setInferredXYZData();
    })
  }

  setInferredXYZData() {
    if (this.resourceInferredReadings.length > 0) {
      this.inferredXYZData = this.resourceInferredReadings[0].value;
    }
    else {
      this.inferredXYZData = ""
    }
  }
}
