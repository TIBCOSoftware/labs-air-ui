import { Component, OnInit, Input, ɵCompiler_compileModuleSync__POST_R3__ } from '@angular/core';
import { FormGroup, FormBuilder, Form } from '@angular/forms';
import { Subscription, Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FlogoDeployService } from '../../../services/deployment/flogo-deploy.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';


@Component({
  selector: 'app-pipeline-flogo-flow',
  templateUrl: './pipeline-flogo-flow.component.html',
  styleUrls: ['./pipeline-flogo-flow.component.css']
})
export class PipelineFlogoFlowComponent implements OnInit {


  @Input() flogoFlowForm: FormGroup;

  dataSource = [];
  columnHeader = ['name', 'type', 'value']
  dataSourceChange = new Subject();

  constructor(private flogoDeployService: FlogoDeployService,
    private _snackBar: MatSnackBar,
    private formBuilder: FormBuilder) {

  }

  ngOnInit(): void {
    // when a value changes on the array, update the form value.
    this.dataSourceChange
      .pipe(debounceTime(800),distinctUntilChanged())
      .subscribe(() => {
        this.flogoFlowForm.patchValue({
          flowProperties: JSON.stringify(this.dataSource)
        });
      });
  }

  onFileSelected(event) {

    const file: File = event.target.files[0];

    if (file) {

      console.log("Selected file: ", file.name);

      let fileReader = new FileReader();
      fileReader.onload = (e) => {
        console.log("File content: ", fileReader.result);
        this.flogoFlowForm.patchValue(
          {
            flowFilename: file.name,
            flowDefinition: fileReader.result
          },
          { emitEvent: false }
        );

        // Get application properties
        this.getFlogoAppProperties(fileReader.result)
      }

      fileReader.readAsText(file);

    }
  }

  getFlogoAppProperties(flowDefinition) {
    if (flowDefinition != "") {
      let request = {
        flogoApp: flowDefinition
      }

      this.flogoDeployService.getFlogoPropertiesF1(request)
        .subscribe(res => {
          console.log("Received getFlogoPropertiesF1 response: ", res);

          this.flogoFlowForm.patchValue({
            flowProperties: JSON.stringify(res.properties),
          });

          this.dataSource = res.properties;
          console.log('DATA SOURCE', this.dataSource);

          // let message = 'Success';
          // if (res == undefined || res.Success == false) {
          //   message = 'Failure';
          // }

          // this._snackBar.open(message, "Deploy Pipeline", {
          //   duration: 3000,
          // });

        });
    }
  }

  dataSourceChanged () {
    this.dataSourceChange.next()
  }

}
