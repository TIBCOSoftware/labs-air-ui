import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { Subscription } from 'rxjs';
import { Device, Resource, TSReading } from 'src/app/shared/models/iot.model';
import { GraphService } from '../../../services/graph/graph.service';

@Component({
  selector: 'app-iot-gateway-location',
  templateUrl: './iot-gateway-location.component.html',
  styleUrls: ['./iot-gateway-location.component.css']
})
export class IotGatewayLocationComponent implements OnInit, OnDestroy {
  device: Device;
  instrument: Resource;
  resourceReadings = [];
  resourceInferredReadings = [];
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

  scatterChartType = 'scatter';
  scatterChartDatasets = [
    {
      label: '',
      type: 'scatter',
      pointRadius: 5,
      fill: false,
      // lineTension: 0,
      borderWidth: 2,
      data: []
    },
  ];

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
    this.getReadings();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

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

  public setScatterChartDataSet() {
    this.locationData = [];
    this.resourceReadings.forEach(
      reading => {
        let coords = reading.value.split(",", 2);
        this.locationData.push({ x: Number(coords[0]), y: Number(coords[1]) });
      }
    );
    this.scatterChartDatasets[0].data = this.locationData;
  }

  public getReadings() {
    this.subscriptions.push(this.graphService.getReadings(this.device.name, this.instrument.name, 300)
      .subscribe(res => {
        this.resourceReadings = res as TSReading[];
        this.setScatterChartDataSet();
      }));
  }

  public getReadingsBetween(deviceName, resourceName, fromts, tots) {
    this.subscriptions.push(this.graphService.getReadingsBetween(deviceName, resourceName, fromts, tots)
      .subscribe(res => {
        this.resourceReadings = res as TSReading[];
        this.setScatterChartDataSet()
      }));
  }

  startDateEvent(event: MatDatepickerInputEvent<Date>) {
    this.queryStartDate = event.value.valueOf();
    this.startDateSelected = true;
    if (this.endDateSelected) {
      this.queryByDateDisabled = false;
    }
  }

  endDateEvent(event: MatDatepickerInputEvent<Date>) {
    this.queryEndDate = event.value.valueOf();
    this.endDateSelected = true;
    if (this.startDateSelected) {
      this.queryByDateDisabled = false;
    }
  }

  onQueryByDateClicked() {
    this.getReadingsBetween(this.device.name, this.instrument.name, this.queryStartDate, this.queryEndDate);
  }

  onQueryLastValuesClicked() {
    this.getReadings();
  }
}
