import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

export interface SelectItem {
  value: string;
  viewValue: string;
}

@Component({
    selector: 'app-common-pipeline-config',
    templateUrl: './pipeline-config.component.html',
    styleUrls: ['./pipeline-config.component.css']
})
export class PipelineConfigComponent {

  pipelineTypes: SelectItem[] = [
      { value: 'Cloud', viewValue: 'Cloud' },
      { value: 'Edge', viewValue: 'Edge' }
  ];

  deployerTypes: SelectItem[] = [
      { value: 'AIR', viewValue: 'AIR Deployer' },
      { value: 'OH', viewValue: 'OpenHorizon' }
  ];

  logLevels: SelectItem[] = [
      { value: 'INFO', viewValue: 'INFO' },
      { value: 'WARN', viewValue: 'WARN' },
      { value: 'ERROR', viewValue: 'ERROR' },
      { value: 'DEBUG', viewValue: 'DEBUG' }
  ];

  @Input() pipelineForm: FormGroup;

  constructor() { }

}
