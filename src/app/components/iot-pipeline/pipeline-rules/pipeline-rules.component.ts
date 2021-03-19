import { Component, OnInit, Input } from '@angular/core';
import { Device, Resource } from '../../../shared/models/iot.model';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

export interface SelectItem {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-pipeline-rules',
  templateUrl: './pipeline-rules.component.html',
  styleUrls: ['./pipeline-rules.component.css']
})
export class PipelineRulesComponent implements OnInit {

  @Input() devices: Device[];
  @Input() ruleForm: FormGroup;

  conditionResources: Resource[];
  actionResources: Resource[];

  private subscr1:Subscription;
  private subscr2:Subscription;

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

    let idx = this.getIndexForDevice(this.ruleForm.get('condDevice').value);

    if (idx >= 0)
      this.conditionResources = this.devices[idx].profile.deviceResources as Resource[];

    idx = this.getIndexForDevice(this.ruleForm.get('actionDevice').value);

    if (idx >= 0)
      this.actionResources = this.devices[idx].profile.deviceResources as Resource[];


    this.onFormChanges();
  }

  onConditionDeviceSelected(event) {

    console.log('Condition Device Selected: ', event);

    // Set the resourceDataSource
    let idx = this.getIndexForDevice(event.value);
    this.conditionResources = this.devices[idx].profile.deviceResources as Resource[];
  }

  onActionDeviceSelected(event) {

    console.log('Action Device Selected: ', event);

    // Set the resourceDataSource
    let idx = this.getIndexForDevice(event.value);
    this.actionResources = this.devices[idx].profile.deviceResources as Resource[];
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

    this.subscr1 = this.ruleForm.get('condDevice').valueChanges.subscribe(val => {

      // Set the resourceDataSource
      let idx = this.getIndexForDevice(val);

      if (idx >= 0)
        this.conditionResources = this.devices[idx].profile.deviceResources as Resource[];      
    });

    this.subscr2 = this.ruleForm.get('actionDevice').valueChanges.subscribe(val => {

      // Set the resourceDataSource
      let idx = this.getIndexForDevice(val);

      if (idx >= 0)
        this.actionResources = this.devices[idx].profile.deviceResources as Resource[];      
    });

  }

}
