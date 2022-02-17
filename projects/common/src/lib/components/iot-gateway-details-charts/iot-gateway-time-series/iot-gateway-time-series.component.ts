import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { Subscription } from 'rxjs';
import { Device, Resource, TSReading } from '../../../models/iot.model';
import { GraphService } from '../../../services/graph/graph.service';
import { ChartConfiguration, ChartOptions, ChartType, Tooltip, Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import 'chartjs-adapter-luxon';
import StreamingPlugin from 'chartjs-plugin-streaming';

Chart.register(StreamingPlugin);

@Component({
  selector: "app-common-iot-gateway-time-series",
  templateUrl: "./iot-gateway-time-series.component.html",
  styleUrls: ["./iot-gateway-time-series.component.css"],
})
export class CommonIotGatewayTimeSeriesComponent implements OnInit, OnDestroy {
  device: Device;
  instrument: Resource;
  subscriptions: Subscription[] = [];
  instrumentForm: FormGroup;
  resourceReadings: TSReading[] = [];
  resourceInferredReadings: TSReading[] = [];
  numReadings = 300;

  timeSeriesData = [];
  timeSeriesInferredData = [];

  queryLastValuesDisabled = false;
  queryByDateDisabled = true;
  startDateSelected = false;
  endDateSelected = false;
  queryStartDate = Date.now();
  queryEndDate = Date.now();

  chartType: ChartType = "line";
  chartLegend = true;
  chartStreamingLegend = true;
  streamLastQuery = Date.now();

  streaming = false;

  lineChartPlugins = [Tooltip, ChartDataLabels];

  // chartDatasets: ScatterChartDataset[] = [ new ScatterChartDataset("", "line", 0, true, 0, 2, []), new ScatterChartDataset("Inferred", "line", 0, true, 0, 2, []),];
  chartDatasets: ChartConfiguration["data"] = {
    datasets: [
      {
        data: [],
        label: "",
        fill: true,
        borderWidth: 2,
        tension: 0,
        backgroundColor: "rgba(148,159,177,0.2)",
        borderColor: "rgba(148,159,177,1)",
        pointBackgroundColor: "rgba(148,159,177,1)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(148,159,177,0.8)",
      },
      {
        data: [],
        label: "Inferred",
        fill: true,
        borderWidth: 2,
        tension: 0,
        backgroundColor: "rgba(255,0,0,0.3)",
        borderColor: "red",
        pointBackgroundColor: "rgba(148,159,177,1)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(148,159,177,0.8)",
      },
    ],
  };

  chartOptions: ChartOptions = {
    responsive: true,
    aspectRatio: 5,
    scales: {
      x: {
        type: "timeseries",
        ticks: {
          autoSkip: true,
        },
      },
      y: {
        title: {
          display: true,
          text: "Reading",
        },
        beginAtZero: true,
      },
    },
    plugins: {
      datalabels: {
        display: false,
      },
    },
  };

  chartStreamingDatasets: ChartConfiguration["data"] = {
    datasets: [
      {
        label: "",
        // borderColor: 'blue',
        type: "line",
        fill: true,
        tension: 0,
        borderWidth: 2,
        data: [],
      },
    ],
  };

  chartStreamingOptions: ChartConfiguration["options"] = {
    responsive: true,
    aspectRatio: 5,
    scales: {
      x: {
        type: "realtime",
        realtime: {
          onRefresh: (chart) => this.getStreamData(chart),
          delay: 2000,
          refresh: 10000, // 1000
          duration: 120000,
        },
      },
      y: {
        title: {
          display: true,
          text: "Reading",
        },
        beginAtZero: true,
      },
    },
    plugins: {
      streaming: {
        duration: 10000,
      },
      tooltip: {
        intersect: false,
      },
    },
  };

  constructor(
    private graphService: GraphService,
    private formBuilder: FormBuilder
  ) {
    this.instrumentForm = this.formBuilder.group({
      valueType: [""],
      valueReadWrite: [""],
      valueMinimum: [""],
      valueMaximum: [""],
      valueDefault: [""],
      valueUnit: [""],
      interface: [""],
      interfacePinNumber: [""],
      interfaceType: [""],
    });
  }

  ngOnInit(): void {
    let attrInterface = "";
    let attrPinNum = "";
    let attrType = "";
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
      interfaceType: attrType,
    });
    // this.chartDatasets[0].label = this.instrument.name;
    // this.chartStreamingDatasets[0].label = this.instrument.name;
    this.chartDatasets.datasets[0].label = this.instrument.name;
    this.chartStreamingDatasets.datasets[0].label = this.instrument.name;
    this.getReadings();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  getReadings() {
    this.subscriptions.push(
      this.graphService
        .getReadings(this.device.name, this.instrument.name, 300)
        .subscribe((res) => {
          this.resourceReadings = res as TSReading[];
          this.getInferredReadings(
            this.device.name,
            this.instrument.name + "_Inferred",
            this.numReadings,
            0
          );
          this.setChartDataSet();
        })
    );
  }

  getInferredReadings(
    deviceName: string,
    resourceName: string,
    numReadings: number,
    ts: number
  ) {
    this.subscriptions.push(
      this.graphService
        .getReadings(deviceName, resourceName, numReadings)
        .subscribe((res) => {
          this.resourceInferredReadings = res as TSReading[];

          // Set Data for chart dataset
          this.setChartInferredDataSet();
        })
    );
  }

  getReadingsBetween(
    deviceName: string,
    resourceName: string,
    fromts: number,
    tots: number
  ) {
    this.subscriptions.push(
      this.graphService
        .getReadingsBetween(deviceName, resourceName, fromts, tots)
        .subscribe((res) => {
          this.resourceReadings = res as TSReading[];
          this.setChartDataSet();
        })
    );
  }

  setChartDataSet() {
    this.timeSeriesData = [];
    this.resourceReadings.forEach((reading) => {
      if (isNaN(+reading.value)) {
        this.timeSeriesData.push({
          x: new Date(reading.created).toISOString(),
          y: reading.value == "true" ? 1 : 0,
        });
      } else {
        this.timeSeriesData.push({
          x: new Date(reading.created).toISOString(),
          y: reading.value,
        });
      }
    });
    this.chartDatasets.datasets[0].data = this.timeSeriesData;
  }

  setChartInferredDataSet() {
    this.timeSeriesInferredData = [];
    this.resourceInferredReadings.forEach((reading) => {
      if (!reading.value) {
        this.timeSeriesInferredData.push({
          x: new Date(reading.created).toISOString(),
          y: reading.value == "true" ? 1 : 0,
        });
      } else {
        this.timeSeriesInferredData.push({
          x: new Date(reading.created).toISOString(),
          y: reading.value,
        });
      }
    });
    this.chartDatasets.datasets[1].data = this.timeSeriesInferredData;
  }

  getStreamData(chart: any) {
    this.graphService
      .getReadingsStartingAt(
        this.device.name,
        this.instrument.name,
        this.streamLastQuery
      )
      .subscribe((res) => {
        this.resourceReadings = res as TSReading[];
        console.log(
          "reading data in getStreamingData: ",
          this.resourceReadings
        );
        this.resourceReadings.forEach((reading) => {
          if (!reading.value) {
            chart.data.datasets[0].data.push({
              x: new Date(reading.created).toISOString(),
              y: reading.value == "true" ? 1 : 0,
            });
          } else {
            chart.data.datasets[0].data.push({
              x: new Date(reading.created).toISOString(),
              y: reading.value,
            });
          }
          this.streamLastQuery = reading.created;
        });
      });
  }

  startDateEvent(event: MatDatepickerInputEvent<Date>) {
    if (event && event.value) {
      this.queryStartDate = event.value.valueOf();
      this.startDateSelected = true;
      if (this.endDateSelected) {
        this.queryByDateDisabled = false;
      }
    }
  }

  endDateEvent(event: MatDatepickerInputEvent<Date>) {
    if (event && event.value) {
      this.queryEndDate = event.value.valueOf();
      this.endDateSelected = true;
      if (this.startDateSelected) {
        this.queryByDateDisabled = false;
      }
    }
  }

  onQueryByDateClicked() {
    this.getReadingsBetween(
      this.device.name,
      this.instrument.name,
      this.queryStartDate,
      this.queryEndDate
    );
  }

  onQueryLastValuesClicked() {
    this.getReadings();
  }

  toggleChart() {
    this.streaming = !this.streaming;
  }
}
