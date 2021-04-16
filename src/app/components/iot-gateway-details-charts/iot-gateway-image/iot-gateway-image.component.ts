import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Device, Resource, TSReading } from 'src/app/shared/models/iot.model';
import { GraphService } from '../../../services/graph/graph.service';

@Component({
  selector: 'app-iot-gateway-image',
  templateUrl: './iot-gateway-image.component.html',
  styleUrls: ['./iot-gateway-image.component.css']
})
export class IotGatewayImageComponent implements OnInit, OnDestroy {
  device: Device;
  instrument: Resource;
  imageData = "";
  inferredImageData = '';
  resourceReadings = [];
  resourceInferredReadings = [];
  subscriptions: Subscription[] = [];

  constructor(private graphService: GraphService) { }

  ngOnInit(): void {
    this.getReadings()
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  public setInferredImageData() {
    if (this.resourceInferredReadings.length > 0) {
      console.log("Encoded inferred reading: ", this.resourceInferredReadings[0].value);
      console.log("Decoded inferred reading: ", atob(this.resourceInferredReadings[0].value));

      this.inferredImageData = atob(this.resourceInferredReadings[0].value);
    }
    else {
      this.inferredImageData = ""
    }
  }

  getReadings() {
    this.subscriptions.push(this.graphService.getReadings(this.device.name, this.instrument.name, 1)
      .subscribe(res => {
        this.resourceReadings = res as TSReading[];

        if (this.resourceReadings.length > 0) {
          this.getResourceInferredReadings(this.device.name, this.instrument.name + "_Inferred", 1, this.resourceReadings[0].created)
          this.setImageData();
        }
      }));
  }

  getResourceInferredReadings(deviceName, resourceName, numReadings, ts) {
    this.subscriptions.push(this.graphService.getReadingsAt(deviceName, resourceName, ts)
      .subscribe(res => {
        this.resourceInferredReadings = res as TSReading[];
        this.inferredImageData = ""
        this.setInferredImageData();
      }));
  }

  public setImageData() {
    this.imageData = this.resourceReadings[0].value;
  }
}
