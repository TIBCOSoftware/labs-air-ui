import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, FormArray } from '@angular/forms';
import { Device } from '../../../shared/models/iot.model';

export interface SelectItem {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-data-filtering',
  templateUrl: './data-filtering.component.html',
  styleUrls: ['./data-filtering.component.css']
})
export class DataFilteringComponent implements OnInit {

  @Input() filteringForm: FormGroup;
  @Input() devices: Device[];

  constructor() { }

  ngOnInit() {
    console.log("Configuring filters for: ", this.devices);
  }

  stepSubmitted() {
    // this.transportForm.get('transport').markAsTouched();
    // this.transportForm.get('transport').updateValueAndValidity();
    // this.transportForm.get('personalDetails').get('lastname').markAsTouched();
    // this.transportForm.get('personalDetails').get('lastname').updateValueAndValidity();
  }

  // onChange(event, index, device) {

  //   const devicesArray: FormArray = this.filteringForm.get('deviceNames') as FormArray;

  //   if (event.checked) {
  //     console.log("Pushing formcontrol: ", device.name);
      
  //     devicesArray.push(new FormControl(device.name));
  //   } else {
  //     let i: number = 0;
  //     devicesArray.controls.forEach((item: FormControl) => {
  //       if (item.value == device.name) {
  //         console.log("Popping formcontrol: ", device.name);
          
  //         devicesArray.removeAt(i);
  //         return;
  //       }
  //       i++;
  //     });
  //   }
  //   console.log(this.filteringForm.value)
  // }


}
