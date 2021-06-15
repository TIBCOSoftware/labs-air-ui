import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { Subscription } from 'rxjs';
import { Device, Resource, ScatterChartDataset, TSReading } from 'src/app/shared/models/iot.model';
import { GraphService } from '../../../services/graph/graph.service';
import { SelectionModel } from '@angular/cdk/collections';
import { ChartOptions, ChartType } from 'chart.js';

@Component({
  selector: 'app-iot-gateway-time-series',
  templateUrl: './iot-gateway-time-series.component.html',
  styleUrls: ['./iot-gateway-time-series.component.css']
})
export class IotGatewayTimeSeriesComponent implements OnInit, OnDestroy {
  device: Device = new Device;
  instrument: Resource = new Resource;
  subscriptions: Subscription[] = [];
  instrumentForm: FormGroup;
  resourceReadings: TSReading[] = [];
  resourceInferredReadings: TSReading[] = [];
  numReadings = 300;

  timeSeriesData: {}[]= [];
  timeSeriesInferredData: {}[] = [];

  queryLastValuesDisabled = false;
  queryByDateDisabled = true;
  startDateSelected = false;
  endDateSelected = false;
  queryStartDate = Date.now();
  queryEndDate = Date.now();

  chartType: ChartType = 'line';
  chartLegend = true;
  chartStreamingLegend = true;
  streamLastQuery = Date.now();

  streaming = false;

  lineChartColors = [
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    { // red
      backgroundColor: 'rgba(255,0,0,0.3)',
      borderColor: 'red',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];

  chartDatasets: ScatterChartDataset[] = [ new ScatterChartDataset("", "line", 0, true, 0, 2, []), new ScatterChartDataset("Inferred", "line", 0, true, 0, 2, []),];

  chartOptions: ChartOptions = {
    responsive: true,
    aspectRatio: 5,
    scales: {
      xAxes: [{
        type: 'time',
        distribution: 'series',
        ticks: {
          source: 'data',  // can use auto
          autoSkip: true
        }
      }],
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Reading'
        },
        ticks: {
          beginAtZero: true
        }
      }]
    },
    tooltips: {
      enabled: true,
      intersect: false
    },
    plugins: {
      streaming: false,
      datalabels: {
        display: false
      }
    }
  };

  chartStreamingDatasets = [
    {
      label: '',
      // borderColor: 'blue',
      type: 'line',
      fill: true,
      lineTension: 0,
      borderWidth: 2,
      data: []
    },
  ];

  chartStreamingOptions = {
    responsive: true,
    aspectRatio: 5,
    scales: {
      xAxes: [{
        type: 'realtime',
        realtime: {
          onRefresh: this.getStreamData.bind(this),
          delay: 2000,
          refresh: 10000, // 1000
          duration: 120000
        }
      }],
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Reading'
        },
        ticks: {
          beginAtZero: true
        }
      }]
    },
    tooltips: {
      enabled: true,
      intersect: false
    },
    plugins: {
      datalabels: {
        display: false
      }
    }
  };

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
      valueType: this.instrument.properties.value.type,
      valueReadWrite: this.instrument.properties.value.readWrite,
      valueMinimum: this.instrument.properties.value.minimum,
      valueMaximum: this.instrument.properties.value.maximum,
      valueDefault: this.instrument.properties.value.defaultValue,
      valueUnit: this.instrument.properties.units.defaultValue,
      interface: attrInterface,
      interfacePinNumber: attrPinNum,
      interfaceType: attrType
    });
    this.chartDatasets[0].label = this.instrument.name;
    this.chartStreamingDatasets[0].label = this.instrument.name;
    this.getReadings();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }


  getReadings() {
    this.subscriptions.push(this.graphService.getReadings(this.device.name, this.instrument.name, 300)
      .subscribe(res => {
        this.resourceReadings = res as TSReading[];
        this.getInferredReadings(this.device.name, this.instrument.name + "_Inferred", this.numReadings, 0)
        this.setChartDataSet();
      }))
  }

  getInferredReadings(deviceName: string, resourceName: string, numReadings: number, ts: number) {
    this.subscriptions.push(this.graphService.getReadings(deviceName, resourceName, numReadings)
      .subscribe(res => {
        this.resourceInferredReadings = res as TSReading[];

        // Set Data for chart dataset
        this.setChartInferredDataSet();
      }))
  }

  getReadingsBetween(deviceName: string, resourceName: string, fromts: number, tots: number) {
    this.subscriptions.push(this.graphService.getReadingsBetween(deviceName, resourceName, fromts, tots)
      .subscribe(res => {
        this.resourceReadings = res as TSReading[];
        this.setChartDataSet()
      }));
  }

  setChartDataSet() {
    this.timeSeriesData = [];
    this.resourceReadings.forEach(
      reading => {
        if (!reading.value) {
          this.timeSeriesData.push({ x: new Date(reading.created).toISOString(), y: reading.value == 'true' ? 1 : 0 });
        }
        else {
          this.timeSeriesData.push({ x: new Date(reading.created).toISOString(), y: reading.value });
        }
      }
    );
    this.chartDatasets[0].data = this.timeSeriesData;
  }

  setChartInferredDataSet() {
    this.timeSeriesInferredData = [];
    this.resourceInferredReadings.forEach(
      reading => {

        if (!reading.value) {
          this.timeSeriesInferredData.push({ x: new Date(reading.created).toISOString(), y: reading.value == 'true' ? 1 : 0 });
        }
        else {
          this.timeSeriesInferredData.push({ x: new Date(reading.created).toISOString(), y: reading.value });
        }
      }
    );
    this.chartDatasets[1].data = this.timeSeriesInferredData;
  }

  getStreamData(chart: any) {
    //MAG
    this.graphService.getReadingsStartingAt(this.device.name,
      this.instrument.name, this.streamLastQuery)
      .subscribe(res => {
        this.resourceReadings = res as TSReading[];
        console.log("reading data in getStreamingData: ", this.resourceReadings);
        this.resourceReadings.forEach(
          reading => {
            if (!reading.value) {
              chart.data.datasets[0].data.push({ x: new Date(reading.created).toISOString(), y: reading.value == 'true' ? 1 : 0 });
            }
            else {
              chart.data.datasets[0].data.push({ x: new Date(reading.created).toISOString(), y: reading.value });
            }
            this.streamLastQuery = reading.created;
          }
        );
      })
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

  toggleChart() {
    this.streaming = !this.streaming;
  }
}
