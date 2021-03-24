import { Component, OnInit, Directive, ViewContainerRef, ViewChild, ComponentFactoryResolver } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { GraphService } from '../../services/graph/graph.service';
import { Device, Gateway, Command } from '../../shared/models/iot.model';
import { EdgeService } from '../../services/edge/edge.service';
import { BreadcrumbsService } from '../../services/breadcrumbs/breadcrumbs.service';
import { IotGatewayOverviewComponent } from '../iot-gateway-details-charts/iot-gateway-overview/iot-gateway-overview.component'
import { IotGatewayTemperatureComponent } from '../iot-gateway-details-charts/iot-gateway-temperature/iot-gateway-temperature.component';
import { IotGatewayPressureComponent } from '../iot-gateway-details-charts/iot-gateway-pressure/iot-gateway-pressure.component';
import { IotGatewayMagnetometerComponent } from '../iot-gateway-details-charts/iot-gateway-magnetometer/iot-gateway-magnetometer.component';
import { IotGatewayGyroscopeComponent } from '../iot-gateway-details-charts/iot-gateway-gyroscope/iot-gateway-gyroscope.component';
import { IotGatewayAccelerometerComponent } from '../iot-gateway-details-charts/iot-gateway-accelerometer/iot-gateway-accelerometer.component';
import { IotGatewayProximityComponent } from '../iot-gateway-details-charts/iot-gateway-proximity/iot-gateway-proximity.component';
import { IotGatewayGpsComponent } from '../iot-gateway-details-charts/iot-gateway-gps/iot-gateway-gps.component';
import { IotGatewaySpeedometerComponent } from '../iot-gateway-details-charts/iot-gateway-speedometer/iot-gateway-speedometer.component';
import { IotGatewayHumidityComponent } from '../iot-gateway-details-charts/iot-gateway-humidity/iot-gateway-humidity.component';

@Directive({
  selector: '[sensorData]',
})

export class SensorDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}

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
  selectedDevice: Device;
  selectedDeviceTab = 'Overview'

  @ViewChild(SensorDirective, { static: true }) sensorData: SensorDirective

  menuItems: String[] = [];

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

      })
  }

  public getDevices(gateway: Gateway) {
    this.edgeService.getDevices(gateway)
      .subscribe(res => {
        this.devicesDataSource.data = res as Device[];
        this.selectedDevice = this.devicesDataSource.data[0];
        this.buildSensorList(this.selectedDevice.profile.deviceCommands);
        this.selectChartType('Overview');
      })
  }

  buildSensorList(commandList: Command[]) {
    this.menuItems = ['Overview'];
    commandList.forEach(command => { this.menuItems.push(command.name) });
  }

  selectDevice(newDevice: Device) {
    this.selectedDevice = newDevice;
    // build the a device sensors list
    this.buildSensorList(this.selectedDevice.profile.deviceCommands);
    this.selectChartType('Overview');
  }

  selectChartType(nameOfChart: string, data?: any) {
    this.selectedDeviceTab = nameOfChart;
    const componentFactory = this.getChartComponent(nameOfChart);
    const viewContainerRef = this.sensorData.viewContainerRef;
    viewContainerRef.clear();
    const componentRef = viewContainerRef.createComponent(componentFactory);
    // componentRef.instance.data = 'Data Passed In'
  }

  getChartComponent(chartName: string) {
    switch (chartName) {
      case 'Overview': {
        return this.componentFactoryResolver.resolveComponentFactory(IotGatewayOverviewComponent);
      }
      case 'Temperature': {
        return this.componentFactoryResolver.resolveComponentFactory(IotGatewayTemperatureComponent);
      }
      case 'Pressure': {
        return this.componentFactoryResolver.resolveComponentFactory(IotGatewayPressureComponent);
      }
      case 'Magnetometer': {
        return this.componentFactoryResolver.resolveComponentFactory(IotGatewayMagnetometerComponent);
      }
      case 'Gyroscope': {
        return this.componentFactoryResolver.resolveComponentFactory(IotGatewayGyroscopeComponent);
      }
      case 'Accelerometer': {
        return this.componentFactoryResolver.resolveComponentFactory(IotGatewayAccelerometerComponent);
      }
      case 'Proximity': {
        return this.componentFactoryResolver.resolveComponentFactory(IotGatewayProximityComponent);
      }
      case 'GPS': {
        return this.componentFactoryResolver.resolveComponentFactory(IotGatewayGpsComponent);
      }
      case 'Speedometer': {
        return this.componentFactoryResolver.resolveComponentFactory(IotGatewaySpeedometerComponent);
      }
      case 'Humidity': {
        return this.componentFactoryResolver.resolveComponentFactory(IotGatewayHumidityComponent);
      }
    }
  }
}
