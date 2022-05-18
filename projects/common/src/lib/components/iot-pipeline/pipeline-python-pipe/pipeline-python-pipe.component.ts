import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { PythonResource } from '@TIBCOSoftware/labs-air-graph-client';
import { GraphService } from '@TIBCOSoftware/labs-air-graph-client';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-common-pipeline-python-pipe',
  templateUrl: './pipeline-python-pipe.component.html',
  styleUrls: ['./pipeline-python-pipe.component.css']
})
export class PipelinePythonPipeComponent implements OnInit{

  @Input() pythonPipeForm: FormGroup;
  @Input() gatewayId: string;
  @Input() pythonInputs: any[];
  showResourceConfiguration = false;
  inputSelections = [];

  constructor(private graphService: GraphService) { }

  logLevels = [
    { value: 'INFO', viewValue: 'INFO' },
    { value: 'WARN', viewValue: 'WARN' },
    { value: 'ERROR', viewValue: 'ERROR' },
    { value: 'DEBUG', viewValue: 'DEBUG' }
  ];

  resources: PythonResource[] = [];

  get pipeContextName(): string {
    return this.pythonPipeForm.get('context').get('name').value;
  }

  get pipeInputs(): FormGroup {
    return this.pythonPipeForm.get('context').get('data').get('input') as FormGroup;
  }

  ngOnInit(): void {
    this.showResourceConfiguration = false;
    this.getPythonResources();
    this.checkConnectedNode();
    this.getInputSelection();
    this.pythonPipeForm.controls['name'].valueChanges.pipe(debounceTime(1000)).subscribe(() =>{
      this.checkConnectedNode();
      this.getInputSelection();
    });
  }

  getPythonResources() {
    this.graphService.getPythonResources(this.gatewayId).subscribe(res => this.resources = res.filter(resource => resource.type === 'processor'));
  }

  updateFormOnChange(processorName: string) {
    const processor = this.resources.find(x => x.name === processorName)
    this.pythonPipeForm.patchValue({
      name: processor.name,
      fileContent: processor.fileContent,
      context: {
        name: processor.name,
      }
    })
    const pythonRawOutputs = JSON.parse(atob(processor.outputs));
    const outputControls = pythonRawOutputs.map(x => new FormControl(x));
    (this.pythonPipeForm.get('context').get('data') as FormGroup).setControl('output', new FormArray(outputControls))
  }

  getInputSelection() {
    this.pythonInputs.forEach(node => {
      this.pipeInputs.addControl(node.data.customdata.name, new FormControl(''));
      this.inputSelections.push(node.data.customdata.output);
    })
    this.inputSelections.reverse();
  }

  // checks if the depends is updated to the latest node
  checkConnectedNode() {
    if (this.pythonInputs.length > 0 && this.pythonPipeForm.get('context').get('data').get('dependsOn').value !== this.pythonInputs[0].data.customdata.name) {
      this.pythonPipeForm.patchValue({
        context: {
          data: {
            dependsOn: this.pythonInputs[0].data.customdata.name
          }
        }
      });
    }
  }
}
