import { Component, Input, ViewChildren } from '@angular/core';
import { UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-rest-headers',
  templateUrl: './rest-headers.component.html',
  styleUrls: ['./rest-headers.component.css']
})
export class RestHeadersComponent {

  @Input() formData: UntypedFormGroup;
  @Input() formArrayIndex: number = 0;

  constructor() { }

  // headers need to be in [[{key: keyName, value: keyValue}, ...], ...]

  get headersArray (): UntypedFormArray {
    return this.formData.get('headers') as UntypedFormArray
  }

  get headers (): UntypedFormArray {
    return this.headersArray.controls[this.formArrayIndex] as UntypedFormArray
  }
  
  get headerFormGroup (): [UntypedFormGroup] {
    return this.headers?.controls as [UntypedFormGroup]
  }

  addHeaderArray (): void {
    this.headersArray.push(new UntypedFormArray([]));
  }

  addHeader(): void {
    if (!this.headers) {
      this.addHeaderArray();
    } 
    const formGroup = new UntypedFormGroup({
      key: new UntypedFormControl('',),
      value: new UntypedFormControl('',)
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
