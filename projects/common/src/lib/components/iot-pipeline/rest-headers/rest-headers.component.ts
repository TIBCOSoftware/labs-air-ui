import { Component, Input } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-rest-headers',
  templateUrl: './rest-headers.component.html',
  styleUrls: ['./rest-headers.component.css']
})
export class RestHeadersComponent {

  @Input() formData: FormGroup;

  constructor() { }

  // headers need to be in [{key: keyName, value: keyValue}, ...]

  get headers () {
    return this.formData.get('headers') as FormArray
  }
  
  get headerFormGroup () {
    return this.headers.controls as [FormGroup]
  }

  addHeader() {
    const formGroup = new FormGroup({
      key: new FormControl('',),
      value: new FormControl('',)
    })
    this.headers.push(formGroup);
  }

  deleteHeader(index: number) {
    this.headers.removeAt(index);
  }

}
