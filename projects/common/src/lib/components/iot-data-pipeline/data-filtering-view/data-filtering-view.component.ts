import { Component, Input } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';
import { Device } from '../../../models/iot.model';

export interface SelectItem {
  value: string;
  viewValue: string;
}

@Component({
    selector: 'app-common-data-filtering-view',
    templateUrl: './data-filtering-view.component.html',
    styleUrls: ['./data-filtering-view.component.css']
})
export class DataFilteringViewComponent{

  @Input() filteringForm: FormGroup;
  @Input() devices: Device[];

  constructor() { }

  get deviceSelectedArray(): FormArray {

      return this.filteringForm.get('deviceNames') as FormArray;
  }

}
