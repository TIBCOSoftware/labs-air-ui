import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-pipeline-rest-broadcast',
  templateUrl: './pipeline-rest-broadcast.component.html',
  styleUrls: ['./pipeline-rest-broadcast.component.css']
})
export class PipelineRestBroadcastComponent implements OnInit {

  @Input() restBroadcastForm: FormGroup;
  logLevels = ['info', 'warn', 'error', 'debug'];
  methods = ['PUT', 'POST'];

  constructor() { }

  ngOnInit(): void {
    if (this.restBroadcastForm.get('restURLs').value.length < 1) {
      this.addNewEndpoint();
    }
  }

  addNewEndpoint() {
    this.restURLs.push(new FormControl(''));
    this.restMethods.push(new FormControl(''));
    this.restBodies.push(new FormControl(''));
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

}
