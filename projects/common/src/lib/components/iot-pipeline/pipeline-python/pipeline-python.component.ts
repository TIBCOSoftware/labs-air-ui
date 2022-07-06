import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GraphService, PythonResource } from '@TIBCOSoftware/labs-air-graph-client';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
@Component({
  selector: 'app-pipeline-python',
  templateUrl: './pipeline-python.component.html',
  styleUrls: ['./pipeline-python.component.css']
})
export class PipelinePythonComponent implements OnInit, OnDestroy {

  @Input() gatewayId: string;
  @Input() python: any;
  @Output() formUpdatedEvent = new EventEmitter<PythonResource>();
  formChangeSubscription: Subscription;
  pythonForm: FormGroup;
  resources: {
    processors: PythonResource[],
    requirements: PythonResource[],
    dockerfile: PythonResource[]
  } = { processors: [], requirements: [], dockerfile: [] }
  resourceContent: string;
  showResourceContentBoolean = false;
  languages = ['python'];


  constructor(private graphService: GraphService, private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.getResources();
    this.initForm();
    this.onFormChange();
    if (this.python) {
      this.updatePythonForm(this.python.data['customdata'])
    }
  }

  ngOnDestroy(): void {
    this.formChangeSubscription.unsubscribe();
  }

  getResources() {
    this.graphService.getPythonResources(this.gatewayId).subscribe(resp => {
      this.splitResources(resp);
    })
  }

  splitResources(resources: PythonResource[]) {
    this.resources.processors = resources.filter(resource => resource.type === 'processor');
    this.resources.requirements = resources.filter(resource => resource.type === 'requirement');
    this.resources.dockerfile = resources.filter(resource => resource.type === 'dockerfile')
  }

  updateContent(event: string, file: string) {
    const fileContent = this.resources[file].find(resource => resource.name == event).fileContent;
    const fieldName = file === 'dockerfile' ? 'dockerfileContent' : file.slice(0, -1) + 'Content';
    this.pythonForm.get(fieldName).setValue(fileContent);
  }

  showResourceContent(name: string, resourceType: string) {
    if (name) {
      this.resourceContent = decodeURIComponent(this.resources[resourceType].find(resource => resource.name == name).fileContent);
      this.showResourceContentBoolean = true;
    }
  }

  onFormChange() {
    this.formChangeSubscription = this.pythonForm.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged())
      .subscribe(() => {
        this.formUpdatedEvent.emit(this.pythonForm.value)
      })
  }

  initForm() {
    this.pythonForm = this.formBuilder.group({
      processor: ['', Validators.required],
      processorContent: [''],
      requirement: ['', Validators.required],
      requirementContent: [''],
      dockerfile: [''],
      dockerfileContent: [''],
      volumeName: [''],
      volumePath: [''],
      dataInput: ['', Validators.required],
      producer: ['', Validators.required]
    });
  }

  updatePythonForm(context) {
    if (context != null || context != undefined) {

      this.pythonForm.patchValue({
        processor: context.processor,
        processorContent: context.processorContent,
        requirement: context.requirement,
        requirementContent: context.requirementContent,
        dockerfile: context.dockerfile,
        dockerfileContent: context.dockerfileContent,
        volumeName: context.volumeName,
        volumePath: context.volumePath,
        dataInput: context.dataInput,
        producer: context.producer,
      });
    }
  }
}
