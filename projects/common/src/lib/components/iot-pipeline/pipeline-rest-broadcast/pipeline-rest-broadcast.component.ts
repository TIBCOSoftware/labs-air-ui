import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { MatTabGroup } from '@angular/material/tabs'
import { Model } from '@TIBCOSoftware/labs-air-graph-client';
import { RestHeadersComponent } from '../rest-headers/rest-headers.component';
@Component({
  selector: 'app-pipeline-rest-broadcast',
  templateUrl: './pipeline-rest-broadcast.component.html',
  styleUrls: ['./pipeline-rest-broadcast.component.css']
})
export class PipelineRestBroadcastComponent implements OnInit {

  @Input() restBroadcastForm: FormGroup;
  @Input() models: Model[];
  @ViewChild('tabs') tabGroup: MatTabGroup;
  @ViewChild('restHeaders') restHeaders!: RestHeadersComponent;

  logLevels = ['info', 'warn', 'error', 'debug'];
  methods = ['PUT', 'POST'];

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    if (this.restBroadcastForm.get('restURLs').value.length < 1) {
      this.addNewEndpoint();
    }
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
    this.restBodies.setControl(index, new FormControl(model.inputTemplate));
    this.restMethods.setControl(index, new FormControl(model.method));
    this.endpointNames.setControl(index, new FormControl(model.name));
    const modelHeaderObjArray = JSON.parse(atob(model.headers)) as [];
    const formGroups = modelHeaderObjArray.map(x => this.formBuilder.group(x));
    const formGroupsArray = new FormArray(formGroups) as FormArray;
    this.headers.setControl(index, formGroupsArray);
  }

}
