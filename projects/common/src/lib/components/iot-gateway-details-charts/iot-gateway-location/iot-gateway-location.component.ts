import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { ChartConfiguration, ChartType, ChartData, Tooltip } from 'chart.js';
import { Subscription } from 'rxjs';
import { Device, Resource, TSReading } from '../../../models/iot.model';
import { GraphService } from '../../../services/graph/graph.service';

@Component({
    selector: 'app-common-iot-gateway-location',
    templateUrl: './iot-gateway-location.component.html',
    styleUrls: ['./iot-gateway-location.component.css']
})
export class CommonIotGatewayLocationComponent implements OnInit, OnDestroy {
  device: Device;
  instrument: Resource;
  resourceReadings: TSReading[]  = [];
  resourceInferredReadings: TSReading[]  = [];
  subscriptions: Subscription[] = [];
  locationData = [];

  instrumentForm: FormGroup;

  queryLastValuesDisabled = false
  queryByDateDisabled = true;
  startDateSelected = false;
  endDateSelected = false;
  queryStartDate = Date.now();
  queryEndDate = Date.now();
  chartLegend = true;

  scatterChartPlugins = [Tooltip];

  scatterChartType: ChartType = 'scatter';
  // scatterChartDatasets: ScatterChartDataset[] = [ new ScatterChartDataset("", "scatter", 5, false, 0, 2, []),];
  scatterChartDatasets: ChartData<'scatter'> = {
    datasets: [],
  }

  constructor(private graphService: GraphService, private formBuilder: FormBuilder) {
      this.instrumentForm = this.formBuilder.group({
          valueType: [''],
          valueReadWrite: [''],
          valueMinimum: [''],
          valueMaximum: [''],
          valueDefault: [''],
          valueUnit: [''],
          interface: [''],
          interfacePinNumber: [''],
          interfaceType: ['']
      });
  }

  ngOnInit(): void {
      let attrInterface = '';
      let attrPinNum = '';
      let attrType = '';
      if (this.instrument.attributes != undefined) {
          attrInterface = this.instrument.attributes.Interface;
          attrPinNum = this.instrument.attributes.Pin_Num;
          attrType = this.instrument.attributes.Type;
      }
      this.instrumentForm.patchValue({
          valueType: this.instrument.properties.valueType,
          valueReadWrite: this.instrument.properties.readWrite,
          valueMinimum: this.instrument.properties.minimum,
          valueMaximum: this.instrument.properties.maximum,
          valueDefault: this.instrument.properties.defaultValue,
          valueUnit: this.instrument.properties.units,
          interface: attrInterface,
          interfacePinNumber: attrPinNum,
          interfaceType: attrType
      });
      this.getReadings();
  }

  ngOnDestroy(): void {
      this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  public scatterChartOptions: ChartConfiguration['options']  = {
    responsive: true,
    aspectRatio: 5,
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        ticks: {
          autoSkip: true
        },
        beginAtZero: true,

      },
      y: {
        title: {
          display: true,
          text: 'Y'
        },

        beginAtZero: true
      }
    },
    plugins: {
      tooltip: {
        intersect: true
      }
    }
  }


  public setScatterChartDataSet() {
    this.locationData = [];
    this.resourceReadings.forEach(
      reading => {
        let coords = reading.value.split(",", 2);
        this.locationData.push({ x: Number(coords[0]), y: Number(coords[1]) });
      }
    );
    this.scatterChartDatasets.datasets = this.locationData;
  }

  public getReadings() {
      this.subscriptions.push(this.graphService.getReadings(this.device.name, this.instrument.name, 300)
          .subscribe(res => {
              this.resourceReadings = res as TSReading[];
              this.setScatterChartDataSet();
          }));
  }

  public getReadingsBetween(deviceName: string, resourceName: string, fromts: number, tots: number) {
      this.subscriptions.push(this.graphService.getReadingsBetween(deviceName, resourceName, fromts, tots)
          .subscribe(res => {
              this.resourceReadings = res as TSReading[];
              this.setScatterChartDataSet();
          }));
  }

  startDateEvent(event: MatDatepickerInputEvent<Date>) {
      if (event && event.value){
          this.queryStartDate = event.value.valueOf();
          this.startDateSelected = true;
          if (this.endDateSelected) {
              this.queryByDateDisabled = false;
          }
      }
  }

  endDateEvent(event: MatDatepickerInputEvent<Date>) {
      if (event && event.value){
          this.queryEndDate = event.value.valueOf();
          this.endDateSelected = true;
          if (this.startDateSelected) {
              this.queryByDateDisabled = false;
          }
      }
  }

  onQueryByDateClicked() {
      this.getReadingsBetween(this.device.name, this.instrument.name, this.queryStartDate, this.queryEndDate);
  }

  onQueryLastValuesClicked() {
      this.getReadings();
  }
}