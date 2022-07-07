import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { PythonResource } from '@TIBCOSoftware/labs-air-graph-client';
import { GraphService } from '@TIBCOSoftware/labs-air-graph-client';
import { debounceTime, Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-pipeline-python-pipe',
  templateUrl: './pipeline-python-pipe.component.html',
  styleUrls: ['./pipeline-python-pipe.component.css']
})
export class PipelinePythonPipeComponent implements OnInit, OnDestroy{

  @Input() pythonPipeForm: UntypedFormGroup;
  @Input() gatewayId: string;
  @Input() pythonInputs: any[];
  showResourceConfiguration = false;
  inputSelections = [];
  subscription: Subscription;

  constructor(private graphService: GraphService) { }

  logLevels = [
    { value: 'INFO', viewValue: 'INFO' },
    { value: 'WARN', viewValue: 'WARN' },
    { value: 'ERROR', viewValue: 'ERROR' },
    { value: 'DEBUG', viewValue: 'DEBUG' }
  ];

  resources: PythonResource[] = [];

  useGPUForm = new UntypedFormGroup({
    key: new UntypedFormControl('use_gpu'),
    value: new UntypedFormControl(true)
  })

  get pipeContextName(): string {
    return this.pythonPipeForm.get('context').get('name').value;
  }

  get pipeInputs(): UntypedFormGroup {
    return this.pythonPipeForm.get('context').get('data').get('input') as UntypedFormGroup;
  }

  get configs(): UntypedFormArray {
    return this.pythonPipeForm.get('context').get('data').get('config') as UntypedFormArray
  }

  get useGPU(): boolean{
    return this.configs.value.findIndex(keys => keys.key == 'use_gpu') > 0;
  }

  ngOnInit(): void {
    this.showResourceConfiguration = false;
    this.getPythonResources();
    this.checkConnectedNode();
    this.getInputSelection();
    this.subscription = this.pythonPipeForm.controls['name'].valueChanges.pipe(debounceTime(500)).subscribe(() =>{
      this.checkConnectedNode();
      this.getInputSelection();
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getPythonResources() {
    this.graphService.getPythonResources(this.gatewayId).subscribe(res => this.resources = res.filter(resource => resource.type === 'processor'));
  }

  updateFormOnChange(processorName: string) {
    const processor = this.resources.find(x => x.name === processorName)
    this.pythonPipeForm.patchValue({
      fileContent: processor.fileContent,
      context: {
        name: processor.name,
      }
    })
    const pythonRawOutputs = JSON.parse(atob(processor.outputs));
    const outputControls = pythonRawOutputs.map(x => new UntypedFormControl(x));
    (this.pythonPipeForm.get('context').get('data') as UntypedFormGroup).setControl('output', new UntypedFormArray(outputControls));
    const pythonInputs = JSON.parse(atob(processor.inputs));
    (this.pythonPipeForm.get('context').get('data') as UntypedFormGroup).setControl('input', this.parsePythonInputs(pythonInputs));
  }

  getInputSelection() {
    this.inputSelections = [];
    this.pythonInputs.forEach(node => {
      node.data.customdata.output.forEach(output => this.inputSelections.push(node.data.customdata.name + '.' + output));
    });
  }

  // checks if the depends is updated to the latest node
  checkConnectedNode() {
    (this.pythonPipeForm.get('context').get('data').get('dependsOn') as UntypedFormArray).clear();
    if ((this.pythonInputs.length > 0) && (this.pythonPipeForm.get('context').get('data').get('dependsOn').value[0] !== this.pythonInputs[0].data.customdata.name)) {
      (this.pythonPipeForm.get('context').get('data').get('dependsOn') as UntypedFormArray)
        .push(new UntypedFormControl(this.pythonInputs[0].data.customdata.name))
    } else if ((this.pythonInputs.length > 0) && (this.pythonPipeForm.get('context').get('data').get('dependsOn').value[0] === this.pythonInputs[0].data.customdata.name)) {
      this.pythonPipeForm.get('context').get('data').get('dependsOn').value[0] = this.pythonInputs[0].data.customdata.name
    }
  }

  addConfig() {
    this.configs.push(new UntypedFormGroup({
      key: new UntypedFormControl(),
      value: new UntypedFormControl()
    }))
  }

  deleteConfig(index: number) {
    this.configs.removeAt(index);
  }

  checkGPU(value) {
    if (value) {
      this.configs.push(this.useGPUForm);
    } else {
      this.configs.removeAt(this.configs.value.findIndex(keys => keys.key == 'use_gpu'))
    }
  }

  parsePythonInputs(pythonInputs: [string]): UntypedFormGroup {
    const inputFormGroup = new UntypedFormGroup({});
    pythonInputs.forEach(x => {
      inputFormGroup.addControl(x, new UntypedFormControl('Engine.' + x))
    })
    return inputFormGroup
  }

}
