import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Device, Resource, TSReading } from 'src/app/shared/models/iot.model';
import { GraphService } from '../../../services/graph/graph.service';

@Component({
  selector: 'app-iot-gateway-map',
  templateUrl: './iot-gateway-map.component.html',
  styleUrls: ['./iot-gateway-map.component.css']
})
export class IotGatewayMapComponent implements OnInit, OnDestroy {
  device: Device = new Device;
  instrument: Resource = new Resource;
  mapConfig: {} = {};
  mapMarketUpdate = null;
  createMapFlag = true;
  public resourceReadings: TSReading[] = [];
  public resourceInferredReadings: TSReading[] = []
  subscriptions: Subscription[] = []

  constructor(private graphService: GraphService) { }

  ngOnInit(): void {
    this.getMaps();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  public getMaps() {
    this.subscriptions.push(this.graphService.getReadings(this.device.name, this.instrument.name, 300)
      .subscribe(res => {
        this.resourceReadings = res as TSReading[];
          this.setMapDataSet(this.device.name);
      }));
  }

  public setMapDataSet(deviceName: string) {
    let mapData = [];
    let idx = this.resourceReadings.length - 1;
    let coords = this.resourceReadings[idx].value.split("|", 3);
    console.log("Setting marker for map reading: ", this.resourceReadings[idx].value);
    console.log("Setting marker for map: ", coords);

    mapData.push({
      lat: Number(coords[0]),
      lon: Number(coords[1]),
      label: coords[2],
      uuid: deviceName
    });

    let center = this.graphService.getRouteCenter(deviceName);

    if (this.createMapFlag) {
      this.mapConfig = {
        createMap: this.createMapFlag,
        centerLat: center[0],
        centerLon: center[1],
        zoom: 4,
        showColorAxis: false,
        data: mapData,
        polyline: this.graphService.getRoute(deviceName)
      };
      this.createMapFlag = false;
    }
    else {
      this.mapConfig = {
        createMap: this.createMapFlag,
        data: mapData,
      }
    }
  }
}
