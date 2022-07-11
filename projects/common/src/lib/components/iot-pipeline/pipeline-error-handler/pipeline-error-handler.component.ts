import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Device, Resource } from '../../../models/iot.model';
import { Subscription } from 'rxjs';

export interface SelectItem {
  value: string;
  viewValue: string;
}

@Component({
    selector: 'app-common-pipeline-error-handler',
    templateUrl: './pipeline-error-handler.component.html',
    styleUrls: ['./pipeline-error-handler.component.css']
})
export class PipelineErrorHandlerComponent implements OnInit {

  @Input() errorHandlerForm: UntypedFormGroup;

  logLevels: SelectItem[] = [
      { value: 'INFO', viewValue: 'INFO' },
      { value: 'WARN', viewValue: 'WARN' },
      { value: 'ERROR', viewValue: 'ERROR' },
      { value: 'DEBUG', viewValue: 'DEBUG' }
  ];


  constructor() {
      console.log('constructor streaming component config');
  }

  ngOnInit(): void {

      this.onFormChanges();
  }

  onFormChanges(): void {

  }

}
