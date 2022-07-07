import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormArray, UntypedFormControl, UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatTabGroup } from '@angular/material/tabs'
import { Model } from '@TIBCOSoftware/labs-air-graph-client';
import { RestHeadersComponent } from '../rest-headers/rest-headers.component';
@Component({
  selector: 'app-pipeline-rest-broadcast',
  templateUrl: './pipeline-rest-broadcast.component.html',
  styleUrls: ['./pipeline-rest-broadcast.component.css']
})
export class PipelineRestBroadcastComponent implements OnInit {

  @Input() restBroadcastForm: UntypedFormGroup;
  @Input() models: Model[];
  @ViewChild('tabs') tabGroup: MatTabGroup;
  @ViewChild('restHeaders') restHeaders!: RestHeadersComponent;

  logLevels = ['info', 'warn', 'error', 'debug'];
  methods = ['PUT', 'POST'];

  constructor(private formBuilder: UntypedFormBuilder) { }

  ngOnInit(): void {
    if (this.restBroadcastForm.get('restURLs').value.length < 1) {
      this.addNewEndpoint();
    }
  }

  get restURLs (): UntypedFormArray {
    return this.restBroadcastForm.get('restURLs') as UntypedFormArray;
  }

  get restMethods(): UntypedFormArray {
    return this.restBroadcastForm.get('restMethods') as UntypedFormArray;
  }

  get restBodies(): UntypedFormArray {
    return this.restBroadcastForm.get('restBodies') as UntypedFormArray;
  }

  get endpointNames(): UntypedFormArray {
    return this.restBroadcastForm.get('endpointNames') as UntypedFormArray;
  }

  get headers(): UntypedFormArray {
    return this.restBroadcastForm.get('headers') as UntypedFormArray;
  }

  addNewEndpoint(): void {
    this.restURLs.push(new UntypedFormControl(''));
    this.restMethods.push(new UntypedFormControl(''));
    this.restBodies.push(new UntypedFormControl(''));
    this.endpointNames.push(new UntypedFormControl(''));
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
    this.restURLs.setControl(index, new UntypedFormControl(model.url));
    this.restBodies.setControl(index, new UntypedFormControl(atob(model.inputTemplate)));
    this.restMethods.setControl(index, new UntypedFormControl(model.method));
    this.endpointNames.setControl(index, new UntypedFormControl(model.name));
    const modelHeaderObjArray = JSON.parse(atob(model.headers)) as [];
    const formGroups = modelHeaderObjArray.map(x => this.formBuilder.group(x));
    const formGroupsArray = new UntypedFormArray(formGroups) as UntypedFormArray;
    this.headers.setControl(index, formGroupsArray);
  }

}
