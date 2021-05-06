import { Component, OnInit, Input } from '@angular/core';
import { Device, Resource } from '../../../shared/models/iot.model';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

export interface SelectItem {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-pipeline-rule-expression',
  templateUrl: './pipeline-rule-expression.component.html',
  styleUrls: ['./pipeline-rule-expression.component.css']
})
export class PipelineRuleExpressionComponent implements OnInit {

  @Input() devices: Device[];
  @Input() ruleExpressionForm: FormGroup;

  resources: Resource[];

  private subscr1:Subscription;

  logLevels: SelectItem[] = [
    { value: 'INFO', viewValue: 'INFO' },
    { value: 'WARN', viewValue: 'WARN' },
    { value: 'ERROR', viewValue: 'ERROR' },
    { value: 'DEBUG', viewValue: 'DEBUG' }
  ];

  operations: SelectItem[] = [
    { value: '==', viewValue: '==' },
    { value: '>', viewValue: '>' },
    { value: '>=', viewValue: '>=' },
    { value: '<', viewValue: '<' },
    { value: '<=', viewValue: '<=' }
  ];

  constructor() { }

  ngOnInit(): void {
    let idx = this.getIndexForDevice(this.ruleExpressionForm.get('device').value);

    if (idx >= 0)
      this.resources = this.devices[idx].profile.deviceResources as Resource[];

    this.onFormChanges();
  }

  onDeviceSelected(event) {

    console.log('Device Selected: ', event);

    // Set the resourceDataSource
    let idx = this.getIndexForDevice(event.value);
    this.resources = this.devices[idx].profile.deviceResources as Resource[];
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

  onFormChanges(): void {

    this.subscr1 = this.ruleExpressionForm.get('device').valueChanges.subscribe(val => {

      console.log("Device changed: ", val);
      
      // Set the resourceDataSource
      let idx = this.getIndexForDevice(val);

      console.log("Got index: ", idx);
      

      if (idx >= 0)
        this.resources = this.devices[idx].profile.deviceResources as Resource[];      
    });
  }
  
}
