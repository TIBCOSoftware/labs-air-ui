import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { PythonResource } from '@TIBCOSoftware/labs-air-graph-client';
import { GraphService } from '@TIBCOSoftware/labs-air-graph-client';

@Component({
  selector: 'app-common-pipeline-python-pipe',
  templateUrl: './pipeline-python-pipe.component.html',
  styleUrls: ['./pipeline-python-pipe.component.css']
})
export class PipelinePythonPipeComponent implements OnInit {

  @Input() pythonPipeForm: FormGroup;
  @Input() gatewayId: string;
  showResourceConfiguration = false;
  @Input() pythonInputs: string[];
  @Input() pythonOutputs: string[];

  // need to determine and where each python pipe node is
  order: number;
  dataContextInput = ['Test', 'Test1']
  dataContextOutput = ['Test2', 'Test2']

  constructor(private graphService: GraphService) { }

  logLevels = [
    { value: 'INFO', viewValue: 'INFO' },
    { value: 'WARN', viewValue: 'WARN' },
    { value: 'ERROR', viewValue: 'ERROR' },
    { value: 'DEBUG', viewValue: 'DEBUG' }
  ];

  resources: PythonResource[] = [];

  ngOnInit(): void {
    this.getPythonResources();
  }

  getPythonResources( ) {
    this.graphService.getPythonResources(this.gatewayId).subscribe(res => this.resources = res.filter(resource => resource.type === 'processor'));
  }

//   this.pythonPipeForm = this.formBuilder.group({
//     logLevel: ['INFO', Validators.required],
//     name: ['', Validators.required],
//     context: this.formBuilder.group({
//        name: ['', Validators.required],
//        data: this.formBuilder.group({
//            input: ['', Validators.required],
//            output: this.formBuilder.array([]),
//            dependsOn: ['']
//        })
//     }),
//     dataInput: ['', Validators.required]
// })
}
