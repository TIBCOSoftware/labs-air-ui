import { Component, Input, ViewChildren } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-rest-headers',
  templateUrl: './rest-headers.component.html',
  styleUrls: ['./rest-headers.component.css']
})
export class RestHeadersComponent {

  @Input() formData: FormGroup;
  @Input() formArrayIndex: number = 0;

  constructor() { }

  // headers need to be in [[{key: keyName, value: keyValue}, ...], ...]

  get headersArray (): FormArray {
    return this.formData.get('headers') as FormArray
  }

  get headers (): FormArray {
    return this.headersArray.controls[this.formArrayIndex] as FormArray
  }
  
  get headerFormGroup (): [FormGroup] {
    return this.headers?.controls as [FormGroup]
  }

  addHeaderArray (): void {
    this.headersArray.push(new FormArray([]));
  }

  addHeader(): void {
    if (!this.headers) {
      this.addHeaderArray();
    } 
    const formGroup = new FormGroup({
      key: new FormControl('',),
      value: new FormControl('',)
    })
    this.headers.push(formGroup);
  }

  deleteHeader(index: number): void {
    this.headers.removeAt(index);
  }

  public removeHeaderGroup (index: number): void {
    this.headersArray.removeAt(index);
  }

}
