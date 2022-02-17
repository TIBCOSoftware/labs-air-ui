import { Component, OnInit, Directive, ViewContainerRef, ViewChild, ComponentFactoryResolver } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { GraphService } from '../../services/graph/graph.service';
import { Device, Gateway, Resource } from '../../models/iot.model';
import { EdgeService } from '../../services/edge/edge.service';
import { BreadcrumbsService } from '../../services/breadcrumbs/breadcrumbs.service';
import { CommonIotGatewayOverviewComponent } from '../iot-gateway-details-charts/iot-gateway-overview/iot-gateway-overview.component';
import { CommonIotGatewayMapComponent } from '../iot-gateway-details-charts/iot-gateway-map/iot-gateway-map.component';
import { CommonIotGatewayDiscreteValueComponent } from '../iot-gateway-details-charts/iot-gateway-discrete-value/iot-gateway-discrete-value.component';
import { CommonIotGatewayImageComponent } from '../iot-gateway-details-charts/iot-gateway-image/iot-gateway-image.component';
import { CommonIotGatewayTimeSeriesComponent } from '../iot-gateway-details-charts/iot-gateway-time-series/iot-gateway-time-series.component';
import { CommonIotGatewayXyzValueComponent } from '../iot-gateway-details-charts/iot-gateway-xyz-value/iot-gateway-xyz-value.component';
import { CommonIotGatewayTextComponent } from '../iot-gateway-details-charts/iot-gateway-text/iot-gateway-text.component';

@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: '[sensorData]',
})

export class SensorDirective {
    constructor(public viewContainerRef: ViewContainerRef) { }
}

@Component({
    selector: 'app-common-iot-gateway-details',
    templateUrl: './iot-gateway-details.component.html',
    styleUrls: ['./iot-gateway-details.component.css']
})

export class CommonIotGatewayDetailsComponent implements OnInit {
  deviceList: Device[] = [];
  devicesDataSource = new MatTableDataSource<Device>();
  gatewayId = '';
  gateway: Gateway;
  selectedDevice: Device;
  selectedDeviceTab = 'Overview'
  selectedSensor: Resource;

  @ViewChild(SensorDirective, { static: true }) sensorData: SensorDirective;

  menuItems: string[] = [];

  constructor(private graphService: GraphService,
    private edgeService: EdgeService,
    private route: ActivatedRoute,
    private breadcrumbs: BreadcrumbsService,
    private componentFactoryResolver: ComponentFactoryResolver
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

          });
  }

  public getDevices(gateway: Gateway) {

      const decodedData = atob(gateway.devicesMetadata);
      const jsonData = JSON.parse(decodedData);

      console.log('Devices: ', jsonData);

      this.devicesDataSource.data = jsonData as Device[];
      this.selectedDevice = this.devicesDataSource.data[0];
      this.buildSensorList(this.selectedDevice.profile.deviceResources);
      this.selectChartType('Overview');

  }

  public getDevicesExternal(gateway: Gateway) {
      this.edgeService.getDevices(gateway)
          .subscribe(res => {
              this.devicesDataSource.data = res as Device[];
              this.selectedDevice = this.devicesDataSource.data[0];
              this.buildSensorList(this.selectedDevice.profile.deviceResources);
              this.selectChartType('Overview');
          });
  }

  buildSensorList(deviceResources: Resource[]) {
      this.menuItems = ['Overview'];
      deviceResources.forEach(resource => { this.menuItems.push(resource.name); });
  }

  selectDevice(newDevice: Device) {
      this.selectedDevice = newDevice;
      // build the a device sensors list
      this.buildSensorList(this.selectedDevice.profile.deviceResources);
      this.selectChartType('Overview');
  }

  selectChartType(nameOfChart: string, data?: any) {
      this.selectedDeviceTab = nameOfChart;
      const componentFactory = this.getChartComponent(nameOfChart);
      if (componentFactory){
          const viewContainerRef = this.sensorData.viewContainerRef;
          viewContainerRef.clear();
          const componentRef = viewContainerRef.createComponent(componentFactory);
          componentRef.instance.device = this.selectedDevice;
          componentRef.instance.instrument = this.selectedSensor;
      }
  }

  getChartComponent(nameOfChart: string) {
      if (nameOfChart == 'Overview') {
          return this.componentFactoryResolver.resolveComponentFactory(CommonIotGatewayOverviewComponent);
      } else {
          const sensor = this.selectedDevice.profile.deviceResources.find(({ name }) => name === nameOfChart);

          if (sensor) {
              this.selectedSensor = sensor;
              if (sensor.name == 'GPS' || (sensor.attributes != undefined && sensor.attributes.Visualization != undefined && sensor.attributes.Visualization == 'Map')) {
                  return this.componentFactoryResolver.resolveComponentFactory(CommonIotGatewayMapComponent);
              }
              else if (sensor.name == 'Location') {
                  return this.componentFactoryResolver.resolveComponentFactory(CommonIotGatewayMapComponent);
              }
              else if (sensor.attributes != undefined && sensor.attributes.Visualization != undefined && sensor.attributes.Visualization == 'XYZScatter') {
                  return this.componentFactoryResolver.resolveComponentFactory(CommonIotGatewayXyzValueComponent);
              }
              else if (sensor.properties.valueType == 'String' && sensor.attributes != undefined && sensor.attributes.Visualization != undefined && sensor.attributes.Visualization == 'Custom') {
                  return this.componentFactoryResolver.resolveComponentFactory(CommonIotGatewayDiscreteValueComponent);
              }
              else if (sensor.properties.valueType == 'String') {
                  return this.componentFactoryResolver.resolveComponentFactory(CommonIotGatewayTextComponent);
              }
              else if (sensor.properties.valueType == 'Binary') {
                  return this.componentFactoryResolver.resolveComponentFactory(CommonIotGatewayImageComponent);
              }
              else {
                  return this.componentFactoryResolver.resolveComponentFactory(CommonIotGatewayTimeSeriesComponent);
              }
          } else {
              return this.componentFactoryResolver.resolveComponentFactory(CommonIotGatewayTimeSeriesComponent);
          }
      }
  }
}
