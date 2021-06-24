import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Device, Resource } from '../../../shared/models/iot.model';
import { Subscription } from 'rxjs';

export interface SelectItem {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-pipeline-streaming',
  templateUrl: './pipeline-streaming.component.html',
  styleUrls: ['./pipeline-streaming.component.css']
})
export class PipelineStreamingComponent implements OnInit, OnDestroy {

  @Input() streamingForm: FormGroup;
  @Input() devices: Device[];

  logLevels: SelectItem[] = [
    { value: 'INFO', viewValue: 'INFO' },
    { value: 'WARN', viewValue: 'WARN' },
    { value: 'ERROR', viewValue: 'ERROR' },
    { value: 'DEBUG', viewValue: 'DEBUG' }
  ];
  
  instruments: Resource[] = [];
  private subscr:Subscription;


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

  constructor() {
    console.log("constructor streaming component config");
  }

  ngOnInit(): void {
  
    let idx = this.getIndexForDevice(this.streamingForm.get('deviceName').value);

    if (idx >= 0)
      this.instruments = this.devices[idx].profile.deviceResources as Resource[];

    this.onFormChanges();
  }

  ngOnDestroy(): void {

    // Remove subscription
    this.subscr.unsubscribe();
  }

  getIndexForDevice(name: string): number {
    let idx = -1;

    for (let i = 0; i < this.devices.length; i++) {
       
      if (this.devices[i].name == name) {
        idx = i;
        break;
      } 
    }
    
    return idx;
  }

  onFormChanges(): void {
    // this.streamingForm.valueChanges.subscribe(val => {
    //   console.log("streamingForm has changed for: ", val.name);

    // });

    this.subscr = this.streamingForm.get('deviceName').valueChanges.subscribe(val => {

      // Set the resourceDataSource
      let idx = this.getIndexForDevice(val);

      if (idx >= 0)
        this.instruments = this.devices[idx].profile.deviceResources as Resource[];      
    });

  }

}
