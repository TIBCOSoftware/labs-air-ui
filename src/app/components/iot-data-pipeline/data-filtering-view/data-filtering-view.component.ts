import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';
import { Device } from '../../../shared/models/iot.model';

export interface SelectItem {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-data-filtering-view',
  templateUrl: './data-filtering-view.component.html',
  styleUrls: ['./data-filtering-view.component.css']
})
export class DataFilteringViewComponent implements OnInit {

  @Input() filteringForm: FormGroup;
  @Input() devices: Device[];

  constructor() { }

  ngOnInit() {
  }

  get deviceSelectedArray(): FormArray {

    return this.filteringForm.get('deviceNames') as FormArray;
  }

}
