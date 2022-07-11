import { Component, OnInit, Input } from '@angular/core';
import { Device, Resource } from '../../../models/iot.model';
import { UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

export interface SelectItem {
  value: string;
  viewValue: string;
}

@Component({
    selector: 'app-common-pipeline-rule-text-matching',
    templateUrl: './pipeline-rule-text-matching.component.html',
    styleUrls: ['./pipeline-rule-text-matching.component.css']
})
export class PipelineRuleTextMatchingComponent implements OnInit {

  @Input() ruleTextMatchingForm: UntypedFormGroup;

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
    { value: '<=', viewValue: '<=' },
    { value: 'contains', viewValue: 'contains'}
  ];
  
  constructor() { }

  ngOnInit(): void {

      this.onFormChanges();
  }

  onFormChanges(): void {

  }

}
