import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatTabGroup } from '@angular/material/tabs'
import { Model } from '@TIBCOSoftware/labs-air-graph-client';
import { debounceTime, distinctUntilChanged, Observable, Subscription } from 'rxjs';
import { RestHeadersComponent } from '../rest-headers/rest-headers.component';
@Component({
  selector: 'app-pipeline-rest-broadcast',
  templateUrl: './pipeline-rest-broadcast.component.html',
  styleUrls: ['./pipeline-rest-broadcast.component.css']
})
export class PipelineRestBroadcastComponent implements OnInit, OnDestroy {

  @Input() restBroadcast;
  @Input() models: Model[];
  @ViewChild('tabs') tabGroup: MatTabGroup;
  @ViewChild('restHeaders') restHeaders!: RestHeadersComponent;
  @Output() formUpdatedEvent = new EventEmitter<any>();
  @Input() nodeChangeEvent: Observable<any>;
  nodeChangeSubscription: Subscription;
  formChangeSubscription: Subscription;
  restBroadcastForm: FormGroup;

  logLevels = ['INFO', 'WARN', 'ERROR', 'DEBUG'];
  methods = ['PUT', 'POST'];

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.initForm();
    this.onFormChanges();
    if (this.restBroadcast) {
      this.updateRESTBroadcastForm(this.restBroadcast.data['customdata']);
      if (this.restBroadcastForm.get('restURLs').value.length < 1) {
        this.addNewEndpoint();
      }
    }
  }

  ngOnDestroy(): void {
    this.formChangeSubscription.unsubscribe();
    this.nodeChangeSubscription.unsubscribe();
  }

  get restURLs (): FormArray {
    return this.restBroadcastForm.get('restURLs') as FormArray;
  }

  get restMethods(): FormArray {
    return this.restBroadcastForm.get('restMethods') as FormArray;
  }

  get restBodies(): FormArray {
    return this.restBroadcastForm.get('restBodies') as FormArray;
  }

  get endpointNames(): FormArray {
    return this.restBroadcastForm.get('endpointNames') as FormArray;
  }

  get headers(): FormArray {
    return this.restBroadcastForm.get('headers') as FormArray;
  }

  addNewEndpoint(): void {
    this.restURLs.push(new FormControl(''));
    this.restMethods.push(new FormControl(''));
    this.restBodies.push(new FormControl(''));
    this.endpointNames.push(new FormControl(''));
  }

  deleteEndpoint(): void {
    const currentEndpoint = this.tabGroup.selectedIndex;
    this.restURLs.removeAt(currentEndpoint);
    this.restMethods.removeAt(currentEndpoint);
    this.restBodies.removeAt(currentEndpoint);
    this.restHeaders.removeHeaderGroup(currentEndpoint);
    this.endpointNames.removeAt(currentEndpoint);
  }

  onModelSelected(event, index: number) {
    const model = this.getModelById(event.value);
    this.setForm(model, index);
  }

  getModelById(id) {
    let model = null;
    for (let i = 0; i < this.models.length; i++) {
      if (this.models[i].name == id) {
        model = this.models[i];
      }
    }
    return model;
  }

  setForm(model: Model, index: number) {
    this.restURLs.setControl(index, new FormControl(model.url));
    this.restBodies.setControl(index, new FormControl(atob(model.inputTemplate)));
    this.restMethods.setControl(index, new FormControl(model.method));
    this.endpointNames.setControl(index, new FormControl(model.name));
    const modelHeaderObjArray = JSON.parse(atob(model.headers)) as [];
    const formGroups = modelHeaderObjArray.map(x => this.formBuilder.group(x));
    const formGroupsArray = new FormArray(formGroups) as FormArray;
    this.headers.setControl(index, formGroupsArray);
  }

  initForm() {
    this.restBroadcastForm = this.formBuilder.group({
      logLevel: ['INFO', Validators.required],
      restTimeout: ['60', Validators.required],
      endpointNames: this.formBuilder.array([]),
      restURLs: this.formBuilder.array([]),
      restMethods: this.formBuilder.array([]),
      restBodies: this.formBuilder.array([]),
      headers: this.formBuilder.array([])
  });
  }

  onFormChanges() {
    this.nodeChangeSubscription = this.nodeChangeEvent.subscribe(node => {
      this.updateRESTBroadcastForm(node.data['customdata']);
    });
    this.formChangeSubscription = this.restBroadcastForm.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged())
      .subscribe( () => {
        this.formUpdatedEvent.emit(this.restBroadcastForm.value);
      })
  }

  updateRESTBroadcastForm(context: any) {
    if (context != null || context != undefined) {
        this.restBroadcastForm.patchValue({
            logLevel: context.logLevel,
            restTimeout: context.restTimeout,
        });
        this.restBroadcastForm.setControl('endpointNames', this.formBuilder.array(context.endpointNames))
        this.restBroadcastForm.setControl('restURLs', this.formBuilder.array(context.restURLs));
        this.restBroadcastForm.setControl('restMethods', this.formBuilder.array(context.restMethods));
        this.restBroadcastForm.setControl('restBodies', this.formBuilder.array(context.restBodies));

        const formGroups = context.headers.map(x => this.formBuilder.array(x.map(y => this.formBuilder.group(y)))) as [];
        const headersArray = this.formBuilder.array(formGroups) as FormArray
        this.restBroadcastForm.setControl('headers', headersArray);
    }
}
}
