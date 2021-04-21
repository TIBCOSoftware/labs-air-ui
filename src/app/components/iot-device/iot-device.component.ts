import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, Input, OnDestroy } from '@angular/core';
import { ActivatedRoute } from "@angular/router";

import { SelectionModel } from '@angular/cdk/collections';

import { Device, TSReading, Resource, Gateway } from '../../shared/models/iot.model';
import { EdgeService } from '../../services/edge/edge.service';
import { GraphService } from '../../services/graph/graph.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, startWith, tap, delay } from 'rxjs/operators';
//import { merge } from "rxjs/observable/merge";
//import { fromEvent } from 'rxjs/observable/fromEvent';
import { interval, Subscription } from 'rxjs';


import { GoogleChartInterface } from 'ng2-google-charts/google-charts-interfaces';


import { BaseChartDirective, defaultColors, Label, MultiDataSet, SingleDataSet } from 'ng2-charts';
import { ChartType } from 'chart.js';
import { stringToKeyValue } from '@angular/flex-layout/extended/typings/style/style-transforms';
import 'chartjs-plugin-streaming';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';


@Component({
  selector: 'app-iot-device',
  templateUrl: './iot-device.component.html',
  styleUrls: ['./iot-device.component.css']
})
export class IotDeviceComponent implements OnInit, OnDestroy, AfterViewInit {
  subscription: Subscription;
  source = interval(5000);
  subscribed = false;
  createMapFlag = true;  // Variable indicating if map needs to be created


  // Form variables
  instrumentForm: FormGroup;

  queryStartDate = Date.now();
  queryEndDate = Date.now();
  queryByDateDisabled = true;
  startDateSelected = false;
  endDateSelected = false;
  queryLastValuesDisabled = true;
  mapResource = false;
  imageResource = false;
  locationResource = false;
  xyzValueResource = false;
  timeSeriesResource = false;
  discreteValueResource = false;
  textValueResource = false;
  summaryView = false;
  gatewayList: Gateway[] = [];
  gatewayIdSelected: string = '';

  // Map configuration
  mapConfig = null;
  mapMarkerUpdate = null;

  // Google Chart config
  // public timelineChartData:GoogleChartInterface =  {
  //   chartType: 'Timeline',
  //   dataTable: []
  // }

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

  // Chart variables
  public chartDatasets = [
    {
      label: '',
      // borderColor: 'blue',
      //backgroundColor: 'rgba(54, 162, 235, 0.2)',
      type: 'line',
      // pointRadius: 0,
      fill: true,
      lineTension: 0,
      borderWidth: 2,
      data: []
    },
    {
      label: 'Inferred',
      // borderColor: 'green',
      //backgroundColor: 'rgba(54, 162, 235, 0.2)',
      type: 'line',
      // pointRadius: 0,
      fill: true,
      lineTension: 0,
      borderWidth: 2,
      data: []
    },
  ];

  public chartOptions = {
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

  public lineChartColors = [
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

  public chartStreamingDatasets = [
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

  public chartStreamingOptions = {
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

  public scatterChartDatasets = [
    {
      label: '',
      // borderColor: 'blue',
      // backgroundColor: 'rgba(54, 162, 235, 0.2)',
      type: 'scatter',
      pointRadius: 5,
      fill: false,
      // lineTension: 0,
      borderWidth: 2,
      data: []
    },
  ];

  public scatterChartOptions = {
    responsive: true,
    aspectRatio: 5,
    scales: {
      xAxes: [{
        type: 'linear',
        position: 'bottom',
        ticks: {
          beginAtZero: true,
          source: 'data',  // can use auto
          autoSkip: true
        }
      }],
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Y'
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

  public chartLegend = true;
  public chartStreamingLegend = true;

  public chartType = 'line';
  public scatterChartType = 'scatter';
  public resourceReadings = [];
  public resourceInferredReadings = []

  public timeSeriesData = [];
  public timeSeriesInferredData = []
  public locationData = [];
  public imageData = ""
  public textData = ""
  public inferredImageData = ""
  public inferredXYZData = ""

  public heatmapRefWidth = 45
  public heatmapRefHeight = 27
  public heatmapWidth = this.heatmapRefWidth * 20 + 20
  public heatmapHeight = this.heatmapRefHeight * 20 + 20
  public heatmapMaxDataPoints = 1000
  public heatmapMinDataPoints = 0
  public heatmapConfig = {
    radius: 1
  }
  public heatmapData = {
    max: 5, data: []
  };

  deviceSelected = "";
  resourceSelected = "";
  public streamLastQuery = Date.now();

  deviceOverview = null;
  devicesDataSource = new MatTableDataSource<Device>();
  deviceDisplayedColumns: string[] = ['name', 'id', 'operatingState', 'adminState', 'description'];
  deviceSelection = new SelectionModel<Device>(false, []);


  resourcesDataSource = new MatTableDataSource<Resource>();
  resourceDisplayedColumns: string[] = ['name', 'description'];
  resourceSelection = new SelectionModel<Resource>(false, []);

  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(BaseChartDirective, { static: false }) deviceReportChart: BaseChartDirective;

  constructor(private edgeService: EdgeService,
    private graphService: GraphService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute) {

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

  ngOnInit() {
    this.gatewayIdSelected = this.route.snapshot.paramMap.get('gateway');
    this.getGateways();
    
  }

  ngOnDestroy() {
    if (this.subscribed) {
      this.subscription.unsubscribe();
      this.subscribed = false;
    }
  }

  ngAfterViewInit() {
    this.devicesDataSource.sort = this.sort;
  }

  public getDevices(gateway) {
    this.edgeService.getDevices(gateway)
      .subscribe(res => {
        this.devicesDataSource.data = res as Device[];
      })
  }


  public getResourceReadings(deviceName, resourceName, numReadings) {

    this.graphService.getReadings(deviceName, resourceName, numReadings)
      .subscribe(res => {
        this.resourceReadings = res as TSReading[];

        console.log("reading data for; ", resourceName);
        console.log("reading data: ", this.resourceReadings);

        // Reset data for streaming chart dataset
        this.chartStreamingDatasets[0].data = [];
        this.imageData = ""

        if (this.mapResource) {
          this.setMapDataSet(deviceName);
        }
        else if (this.locationResource) {
          this.setScatterChartDataSet()
        }
        else if (this.discreteValueResource) {
          console.log("calling setMapDataset");
          this.setTimelineDataSet(deviceName);
        }
        else if (this.textValueResource) {
          this.textData = this.resourceReadings[0].value;
        }
        else if (this.imageResource) {

          if (this.resourceReadings.length > 0) {
            this.getResourceInferredReadings(this.deviceSelected, this.resourceSelected + "_Inferred", numReadings, this.resourceReadings[0].created)
            this.setImageData();
          }

        }
        else if (this.xyzValueResource) {

          if (this.resourceReadings.length > 0) {
            this.getResourceInferredReadings(this.deviceSelected, this.resourceSelected + "_Inferred", numReadings, this.resourceReadings[0].created)
            this.setXYZHeatmapDataSet();
          }

        }
        else {
          this.getResourceInferredReadings(this.deviceSelected, this.resourceSelected + "_Inferred", numReadings, 0)
          // Set Data for chart dataset
          this.setChartDataSet();
        }
      })
  }

  public getResourceInferredReadings(deviceName, resourceName, numReadings, ts) {

    if (this.imageResource) {

      this.graphService.getReadingsAt(deviceName, resourceName, ts)
        .subscribe(res => {
          this.resourceInferredReadings = res as TSReading[];
          this.inferredImageData = ""

          console.log("reading inferred data for; ", resourceName);
          console.log("reading inferred data: ", this.resourceInferredReadings);

          this.setInferredImageData();

        })
    }
    else if (this.xyzValueResource) {

      this.graphService.getReadingsAt(deviceName, resourceName, ts)
        .subscribe(res => {
          this.resourceInferredReadings = res as TSReading[];
          this.inferredXYZData = ""

          console.log("reading data: ", this.resourceInferredReadings);

          this.setInferredXYZData();

        })
    }
    else {
      this.graphService.getReadings(deviceName, resourceName, numReadings)
        .subscribe(res => {
          this.resourceInferredReadings = res as TSReading[];

          console.log("reading data: ", this.resourceInferredReadings);

          // Set Data for chart dataset
          this.setChartInferredDataSet();


        })
    }
  }

  public getResourceReadingsBetween(deviceName, resourceName, fromts, tots) {
    this.graphService.getReadingsBetween(deviceName, resourceName, fromts, tots)
      .subscribe(res => {
        this.resourceReadings = res as TSReading[];

        console.log("reading data: ", this.resourceReadings);

        // Reset data for streaming chart dataset
        this.chartStreamingDatasets[0].data = [];

        if (this.mapResource) {
          this.setMapDataSet(deviceName);
        }
        else if (this.locationResource) {
          this.setScatterChartDataSet()
        }
        else {
          // Set Data for chart dataset
          this.setChartDataSet();
        }

      })
  }

  public setChartDataSet() {

    this.timeSeriesData = [];

    this.resourceReadings.forEach(
      reading => {

        if (isNaN(reading.value)) {
          this.timeSeriesData.push({ x: new Date(reading.created).toISOString(), y: reading.value == 'true' ? 1 : 0 });
        }
        else {
          this.timeSeriesData.push({ x: new Date(reading.created).toISOString(), y: reading.value });
        }
      }
    );
    console.log("data transformed: ", this.timeSeriesData);

    this.chartDatasets[0].data = this.timeSeriesData;
  }

  public setChartInferredDataSet() {

    this.timeSeriesInferredData = [];

    this.resourceInferredReadings.forEach(
      reading => {

        if (isNaN(reading.value)) {
          this.timeSeriesInferredData.push({ x: new Date(reading.created).toISOString(), y: reading.value == 'true' ? 1 : 0 });
        }
        else {
          this.timeSeriesInferredData.push({ x: new Date(reading.created).toISOString(), y: reading.value });
        }
      }
    );
    console.log("data transformed: ", this.timeSeriesInferredData);

    this.chartDatasets[1].data = this.timeSeriesInferredData;
  }

  public setImageData() {

    this.imageData = this.resourceReadings[0].value;

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

  public setInferredXYZData() {

    if (this.resourceInferredReadings.length > 0) {
      this.inferredXYZData = this.resourceInferredReadings[0].value;
    }
    else {
      this.inferredXYZData = ""
    }

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
        scaledVal = this.scaleValue(val, [minVal,maxVal], [0,this.heatmapMaxDataPoints]);

        max = Math.max(max, scaledVal);

        scaledDiex = this.scaleValue(reading.diex, [0,this.heatmapRefWidth], [0, this.heatmapWidth]);
        scaledDiey = this.scaleValue(reading.diey, [0,this.heatmapRefHeight], [0, this.heatmapHeight]);

        // console.log("Reading: ", reading);
        xyzData.push({ x: Number(scaledDiex), y: Number(scaledDiey), value: scaledVal, radius: 20});
      }
    );
    console.log("data transformed: ", xyzData);
    console.log("Max Min: ", max, min);
    this.heatmapData = {
      max: max, data: xyzData
    };

  }

  public setScatterChartDataSet() {

    this.locationData = [];

    this.resourceReadings.forEach(
      reading => {

        let coords = reading.value.split(",", 2);
        this.locationData.push({ x: Number(coords[0]), y: Number(coords[1]) });
      }
    );
    console.log("data transformed: ", this.locationData);

    this.scatterChartDatasets[0].data = this.locationData;
  }

  public setMapDataSet(deviceName) {
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

  setTimelineDataSet(deviceName) {
    console.log("setTimelineDataSet pt1");


    let ccComponent = this.timelineChartData.component;

    console.log("setTimelineDataSet pt2");

    this.timelineChartData.dataTable = [];
    this.timelineChartData.dataTable.push(['Name', 'From', 'To']);
    let numReadings = this.resourceReadings.length;

    console.log("setTimelineDataSet pt3: ", numReadings);

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

    console.log("Timeline table: " + this.timelineChartData.dataTable)

    ccComponent.draw();

  }


  public getStreamData(chart: any) {

    //MAG
    if (this.resourceSelection.hasValue()) {


      // console.log("in getting streaming data");

      this.graphService.getReadingsStartingAt(this.deviceSelected,
        this.resourceSelected, this.streamLastQuery)
        .subscribe(res => {
          this.resourceReadings = res as TSReading[];

          console.log("reading data in getStreamingData: ", this.resourceReadings);


          this.resourceReadings.forEach(
            reading => {

              if (isNaN(reading.value)) {
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

  }


  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    // const numSelected = this.deviceSelection.selected.length;
    // const numRows = this.devicesDataSource.data.length;
    // return numSelected === numRows;
    return false;
  }

  applyFilter(filterValue: string) {
    this.devicesDataSource.filter = filterValue.trim().toLowerCase();
  }

  getGateways() {
    console.log("Getting Gateways called")
    this.graphService.getGateway(this.gatewayIdSelected)
      .subscribe(res => {

        // this.gatewayList = [];
        this.gatewayList = res;
        console.log("Gateways Returned: ", res);
        // res.forEach((gate, index) => {
        //   this.gatewayList.push({
        //     value: gate.uuid,
        //     viewValue: gate.uuid
        //   });
        // });
        console.log("Updated gateway list: ", this.gatewayList);

        this.getDevices(this.gatewayList[0]);
      })
  }

  onGatewaySelected(event) {
    console.log("Option selected: ", event);

    this.getDevices(this.gatewayList[event.value]);
  }

  onDeviceClicked(row) {
    if (this.subscribed) {
      this.subscription.unsubscribe();
      this.subscribed = false;
    }


    this.mapResource = false;
    this.imageResource = false;
    this.locationResource = false;
    this.xyzValueResource = false;
    this.timeSeriesResource = false;
    this.discreteValueResource = false;
    this.textValueResource = false;

    // MAG
    // this.summaryView = true;
    this.summaryView = false;

    // Set variables for query enable/disable
    this.queryLastValuesDisabled = true;
    this.queryByDateDisabled = true;

    console.log('Device clicked: ', row);
    this.deviceSelection.select(row);
    this.deviceSelected = row.name;

    // Clear resource selection
    this.resourceSelection.clear();

    this.resourcesDataSource.data = row.profile.deviceResources as Resource[];
    this.deviceOverview = row;
  }

  onResourceClicked(row) {
    if (this.subscribed) {
      this.subscription.unsubscribe();
      this.subscribed = false;
    }

    console.log('Resource clicked: ', row);
    this.resourceSelected = row.name;
    this.mapResource = false;
    this.imageResource = false;
    this.timeSeriesResource = false;
    this.discreteValueResource = false;
    this.textValueResource = false;

    let numReadingsRequired = 300;

    if (this.resourceSelected == "GPS") {
      this.mapResource = true;
    }
    else if (this.resourceSelected == "Location") {
      this.locationResource = true;
    }
    else if (row.attributes != undefined && row.attributes.Visualization != undefined && row.attributes.Visualization == "XYZScatter") {
      this.xyzValueResource = true;
      numReadingsRequired = 1;
    }
    else if (row.properties.value.type == "String" && row.attributes != undefined && row.attributes.Visualization != undefined && row.attributes.Visualization == "Custom") {
      this.discreteValueResource = true;
      numReadingsRequired = 40;
    }
    else if (row.properties.value.type == "String") {
      this.textValueResource = true;
      numReadingsRequired = 1;
    }
    else if (row.properties.value.type == "Binary") {
      this.imageResource = true;
      numReadingsRequired = 1;
    }
    else {
      this.timeSeriesResource = true;
    }

    // Set variables for query enable/disable
    this.queryLastValuesDisabled = false;
    if (this.startDateSelected && this.endDateSelected) {
      this.queryByDateDisabled = false;
    }

    this.resourceSelection.select(row);
    this.chartDatasets[0].label = row.name;

    // Update Instrument Form

    let attrInterface = '';
    let attrPinNum = '';
    let attrType = '';
    if (row.attributes != undefined) {
      attrInterface = row.attributes.Interface;
      attrPinNum = row.attributes.Pin_Num;
      attrType = row.attributes.Type;
    }

    this.instrumentForm.patchValue({
      valueType: row.properties.value.type,
      valueReadWrite: row.properties.value.readWrite,
      valueMinimum: row.properties.value.minimum,
      valueMaximum: row.properties.value.maximum,
      valueDefault: row.properties.value.defaultValue,
      valueUnit: row.properties.units.defaultValue,
      interface: attrInterface,
      interfacePinNumber: attrPinNum,
      interfaceType: attrType
    });

    this.createMapFlag = true;

    this.getResourceReadings(this.deviceSelected, this.resourceSelected, numReadingsRequired);

    if (this.mapResource || this.locationResource || this.imageResource || this.xyzValueResource) {
      this.subscription = this.source.subscribe(val => this.getResourceReadings(this.deviceSelected, this.resourceSelected, numReadingsRequired));
      this.subscribed = true;
    }

  }

  onQueryByDateClicked() {
    // Query data by date
    this.getResourceReadingsBetween(this.deviceSelected, this.resourceSelected, this.queryStartDate, this.queryEndDate);
  }

  onQueryLastValuesClicked() {
    // Query new data
    this.getResourceReadings(this.deviceSelected, this.resourceSelected, 300);
  }

  onAnomalyAnalysis() {

  }

  startDateEvent(event: MatDatepickerInputEvent<Date>) {
    console.log("Date Event received: ", event);

    this.queryStartDate = event.value.valueOf();
    console.log("Date value: ", this.queryStartDate);

    this.startDateSelected = true;

    if (this.endDateSelected) {
      this.queryByDateDisabled = false;
    }
  }

  endDateEvent(event: MatDatepickerInputEvent<Date>) {
    console.log("Date Event received: ", event);

    this.queryEndDate = event.value.valueOf();
    console.log("Date value: ", this.queryEndDate);

    this.endDateSelected = true;

    if (this.startDateSelected) {
      this.queryByDateDisabled = false;
    }
  }

  /* Scale a value from one range to another
  * Example of use:
  *
  * Convert 33 from a 0-100 range to a 0-65535 range
  * var n = scaleValue(33, [0,100], [0,65535]);
  *
  * Ranges don't have to be positive
  * var n = scaleValue(0, [-50,+50], [0,65535]);
  *
  * Ranges are defined as arrays of two values, inclusive
  *
  * The ~~ trick on return value does the equivalent of Math.floor, just faster.
  *
  */
  scaleValue(value, from, to) {
    var scale = (to[1] - to[0]) / (from[1] - from[0]);
    var capped = Math.min(from[1], Math.max(from[0], value)) - from[0];
    return ~~(capped * scale + to[0]);
  }

  // Applied like so, scaling the range 10-50 to a range between 0-100.
  // var scaled = scaleBetween(unscaled, 0, 100, minRange, maxRange);
  scaleBetween(unscaledNum, minAllowed, maxAllowed, min, max) {
    return (maxAllowed - minAllowed) * (unscaledNum - min) / (max - min) + minAllowed;
  }

}
