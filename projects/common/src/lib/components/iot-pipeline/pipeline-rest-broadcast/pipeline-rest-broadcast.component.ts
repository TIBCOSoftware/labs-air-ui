import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { MatTabGroup } from '@angular/material/tabs'
@Component({
  selector: 'app-pipeline-rest-broadcast',
  templateUrl: './pipeline-rest-broadcast.component.html',
  styleUrls: ['./pipeline-rest-broadcast.component.css']
})
export class PipelineRestBroadcastComponent implements OnInit {

  @Input() restBroadcastForm: FormGroup;
  @ViewChild('tabs') tabGroup: MatTabGroup;
  logLevels = ['info', 'warn', 'error', 'debug'];
  methods = ['PUT', 'POST'];

  constructor() { }

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

  addNewEndpoint() {
    this.restURLs.push(new FormControl(''));
    this.restMethods.push(new FormControl(''));
    this.restBodies.push(new FormControl(''));
  }

  deleteEndpoint() {
    const currentEndpoint = this.tabGroup.selectedIndex;
    this.restURLs.removeAt(currentEndpoint);
    this.restMethods.removeAt(currentEndpoint);
    this.restBodies.removeAt(currentEndpoint);
  }

}
