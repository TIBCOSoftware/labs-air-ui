import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FlogoDeployService } from '../../../services/deployment/flogo-deploy.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { SingleValueDialogComponent } from '../pipeline-dialog/single-value-dialog.component';


@Component({
    selector: 'app-common-pipeline-flogo-flow',
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
    private formBuilder: FormBuilder,
    private dialog: MatDialog) {

  }

  ngOnInit(): void {
      // Initialize data source if properties available in flow form
      const properties = this.flogoFlowForm.get('flowProperties').value;

      if (properties != '') {
          this.dataSource = JSON.parse(properties);
      }

      // when a value changes on the array, update the form value.
      this.dataSourceChange
          .pipe(debounceTime(800), distinctUntilChanged())
          .subscribe(() => {
              console.log('Data source changed to: ', this.dataSource);
              this.flogoFlowForm.patchValue({

                  flowProperties: JSON.stringify(this.dataSource)
              });
          });
  }

  onFileSelected(event) {

      const file: File = event.target.files[0];

      if (file) {

          console.log('Selected file: ', file.name);

          const fileReader = new FileReader();
          fileReader.onload = (e) => {
              console.log('File content: ', fileReader.result);
              this.flogoFlowForm.patchValue(
                  {
                      flowFilename: file.name,
                      flowDefinition: fileReader.result
                  },
                  { emitEvent: false }
              );

              // Get application properties
              this.getFlogoAppProperties(fileReader.result);
          };

          fileReader.readAsText(file);

      }
  }

  getFlogoAppProperties(flowDefinition) {
      if (flowDefinition != '') {
          const request = {
              flogoApp: flowDefinition
          };

          this.flogoDeployService.getFlogoPropertiesF1(request)
              .subscribe(res => {
                  console.log('Received getFlogoPropertiesF1 response: ', res);

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

  dataSourceChanged(event, rowId: number, cellsType: string) {

      console.log('Inside dataSourceChanged() event: ', event);

      console.log('Inside dataSourceChanged() rowId and celltype: ', rowId, cellsType);

      console.log('dataSource Inside dataSourceChanged(): ', this.dataSource);

      this.dataSourceChange.next();
  }

  openDialog(rowId, element): void {
      const dialogRef = this.dialog.open(SingleValueDialogComponent, {
          width: '250px',
          data: { value: '' }
      });

      dialogRef.afterClosed().subscribe(result => {

          if (result != undefined) {

              const dsCopy = this.dataSource.slice();

              element.Value = result;


              this.dataSource = dsCopy;

              // Update flogo flow form
              this.flogoFlowForm.patchValue({

                  flowProperties: JSON.stringify(this.dataSource)
              });

          }

      });
  }

}
