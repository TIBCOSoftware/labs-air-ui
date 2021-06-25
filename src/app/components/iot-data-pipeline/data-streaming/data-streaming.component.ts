import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Device, Resource } from '../../../shared/models/iot.model';

export interface SelectItem {
  value: string;
  viewValue: string;
}

export interface SelectItem {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-data-streaming',
  templateUrl: './data-streaming.component.html',
  styleUrls: ['./data-streaming.component.css']
})
export class DataStreamingComponent implements OnInit {

  @Input() streamingForm: FormGroup;
  @Input() devices: Device[];

  instruments: Resource[] = [];

  functions: SelectItem[] = [
    { value: "avg", viewValue: 'AVG' },
    { value: 'sum', viewValue: 'SUM' },
    { value: 'min', viewValue: 'MIN' },
    { value: 'max', viewValue: 'MAX' },
    { value: 'count', viewValue: 'COUNT' },
    { value: 'accumulate', viewValue: 'ACCUMULATE' }
  ];

  windowTypes: SelectItem[] = [
    { value: "tumbling", viewValue: 'TUMBLING' },
    { value: 'sliding', viewValue: 'SLIDING' },
    { value: 'timeTumbling', viewValue: 'TIME TUMBLING' },
    { value: 'timeSliding', viewValue: 'TIME SLIDING' }
  ];

  constructor() { }

  ngOnInit() {
  }

  stepSubmitted() {
  
  }
  
  onDeviceSelected(event) {

    console.log('Device Selected: ', event);

    // Set the resourceDataSource
    let idx = this.getIndexForDevice(event.value);
    this.instruments = this.devices[idx].profile.deviceResources as Resource[];
  }

  getIndexForDevice(name: string): number {
    let idx = 0;

    for (let i = 0; i < this.devices.length; i++) {
       
      if (this.devices[i].name == name) {
        idx = i;
        break;
      } 
    }
    
    return idx;
  }

}
