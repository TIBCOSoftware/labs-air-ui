import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ɵɵsetComponentScope, ɵɵtrustConstantResourceUrl } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { PythonResource } from '@TIBCOSoftware/labs-air-graph-client';
import { GraphService } from '@TIBCOSoftware/labs-air-graph-client';
import { debounceTime, distinctUntilChanged, Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-pipeline-python-pipe',
  templateUrl: './pipeline-python-pipe.component.html',
  styleUrls: ['./pipeline-python-pipe.component.css']
})
export class PipelinePythonPipeComponent implements OnInit, OnDestroy {

  @Input() gatewayId: string;
  @Input() pythonInputs: any[];
  @Input() pythonPipe: any;
  @Output() formUpdatedEvent = new EventEmitter<PythonResource>();
  pythonPipeForm: FormGroup;
  showResourceConfiguration = false;
  inputSelections = [];
  subscription: Subscription;
  formChangeSubscription: Subscription;
  @Input() nodeChangeEvent: Observable<any>;
  nodeChangeSubscription: Subscription;

  constructor(private graphService: GraphService, private formBuilder: FormBuilder) { }

  logLevels = [
    { value: 'INFO', viewValue: 'INFO' },
    { value: 'WARN', viewValue: 'WARN' },
    { value: 'ERROR', viewValue: 'ERROR' },
    { value: 'DEBUG', viewValue: 'DEBUG' }
  ];

  resources: PythonResource[] = [];

  useGPUForm = new FormGroup({
    key: new FormControl('use_gpu'),
    value: new FormControl(true)
  })

  get pipeContextName(): string {
    return this.pythonPipeForm.get('context').get('name').value;
  }

  get pipeInputs(): FormGroup {
    return this.pythonPipeForm.get('context').get('data').get('input') as FormGroup;
  }

  get configs(): FormArray {
    return this.pythonPipeForm.get('context').get('data').get('config') as FormArray
  }

  get useGPU(): boolean {
    return this.configs.value.findIndex(keys => keys.key == 'use_gpu') > 0;
  }

  ngOnInit(): void {
    this.initForm();
    this.getPythonResources();
    this.checkConnectedNode();
    this.onFormChange();
    this.getInputSelection();
    if (this.pythonPipe.data['customdata']) {
      this.updatePythonPipeForm(this.pythonPipe.data['customdata']);
    }
  }

  ngOnDestroy(): void {
    this.nodeChangeSubscription.unsubscribe();
    this.formChangeSubscription.unsubscribe();
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
    const outputControls = pythonRawOutputs.map(x => new FormControl(x));
    (this.pythonPipeForm.get('context').get('data') as FormGroup).setControl('output', new FormArray(outputControls));
    const pythonInputs = JSON.parse(atob(processor.inputs));
    (this.pythonPipeForm.get('context').get('data') as FormGroup).setControl('input', this.parsePythonInputs(pythonInputs));
  }

  getInputSelection() {
    this.inputSelections = [];
    this.pythonInputs.forEach(node => {
      node.data.customdata.context.data.output.forEach(output => this.inputSelections.push(node.data.customdata.context.data.name + '.' + output));
    });
  }

  // checks if the depends is updated to the latest node
  checkConnectedNode() {
    const pythonPipeDependsOn = (this.pythonPipeForm.get('context').get('data').get('dependsOn') as FormArray)
    if ((this.pythonInputs.length > 0) && (pythonPipeDependsOn.value[0] !== this.pythonInputs[0].data.customdata.name)) {
      pythonPipeDependsOn.clear();
      pythonPipeDependsOn.push(new FormControl(this.pythonInputs[0].data.customdata.name))
    } else if ((this.pythonInputs.length > 0) && (pythonPipeDependsOn.value[0] === this.pythonInputs[0].data.customdata.name)) {
      pythonPipeDependsOn.value[0] = this.pythonInputs[0].data.customdata.name
    }
  }

  addConfig() {
    this.configs.push(new FormGroup({
      key: new FormControl(),
      value: new FormControl()
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

  parsePythonInputs(pythonInputs: [string]): FormGroup {
    const inputFormGroup = new FormGroup({});
    pythonInputs.forEach(x => {
      inputFormGroup.addControl(x, new FormControl('Engine.' + x))
    })
    return inputFormGroup
  }

  onFormChange() {
    this.nodeChangeSubscription = this.nodeChangeEvent.subscribe(node => {
      this.updatePythonPipeForm(node.data['customdata']);
    });
    this.formChangeSubscription = this.pythonPipeForm.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged())
      .subscribe(() => {
        this.getInputSelection();
        this.checkConnectedNode();
        this.formUpdatedEvent.emit(this.pythonPipeForm.value);
      })
  }

  initForm() {
    this.pythonPipeForm = this.formBuilder.group({
      logLevel: ['INFO', Validators.required],
      timeout: ['600', Validators.required],
      name: ['', Validators.required],
      context: this.formBuilder.group({
        name: ['', Validators.required],
        data: this.formBuilder.group({
          input: this.formBuilder.group({}),
          output: this.formBuilder.array([]),
          dependsOn: this.formBuilder.array([]),
          config: this.formBuilder.array([])
        })
      }),
      dataInput: ['{\"command\":\"process\", \"data\":{}}'],
      fileContent: ['']
    });
  }

  updatePythonPipeForm(pythonPipe: any) {
    if (pythonPipe != null || pythonPipe != undefined) {
      this.pythonPipeForm.patchValue({
        logLevel: pythonPipe.logLevel,
        timeout: pythonPipe.timeout,
        dataInput: pythonPipe.dataInput,
        fileContent: pythonPipe.fileContent,
        name: pythonPipe.name,
        context: {
          name: pythonPipe.context.name
        }
      });
      if (pythonPipe.context.data.input) {
        (this.pythonPipeForm.get('context').get('data') as FormGroup).setControl('input', this.formBuilder.group(pythonPipe.context.data.input));
      }
      if (pythonPipe.context.data.output) {
        const outputs = pythonPipe.context.data.output.map(x => this.formBuilder.control(x));
        (this.pythonPipeForm.get('context').get('data') as FormGroup).setControl('output', new FormArray(outputs));
      }
      if (pythonPipe.context.data.config.length > 0) {
        const formGroups = pythonPipe.context.data.config.map(x => this.formBuilder.group(x)) as [];
        const configArray = this.formBuilder.array(formGroups) as FormArray
        (this.pythonPipeForm.get('context').get('data') as FormGroup).setControl('config', configArray);
      }
      const dependsOnArray = pythonPipe.context.data.dependsOn.map(x => this.formBuilder.control(x));
      (this.pythonPipeForm.get('context').get('data') as FormGroup).setControl('dependsOn', this.formBuilder.array(dependsOnArray));
    }
  }


}
