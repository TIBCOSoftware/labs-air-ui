import { Component, OnInit, Input, AfterViewInit, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { Model, Gateway } from '../../../shared/models/iot.model';
import { GraphService } from '../../../services/graph/graph.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

export interface SelectItem {
  value: string;
  viewValue: string;
}

@Component({
    selector: 'app-ige-models',
    templateUrl: './ige-models.component.html',
    styleUrls: ['./ige-models.component.css']
})
export class IgeModelsComponent implements OnInit, AfterViewInit {

  hidePassword = true;
  dateFormat = 'yyyy-MM-dd  HH:mm:ss'

  // Form variables
  modelForm: FormGroup;

  mqttProtocol = false;
  kafkaProtocol = false;
  httpProtocol = false;

  graphAddOpDisabled = true;
  graphUpdateOpDisabled = true;
  graphDeleteOpDisabled = true;

  modelsDataSource = new MatTableDataSource<Model>();
  modelDisplayedColumns: string[] = ['id', 'name', 'inputType', 'scope', 'created', 'modified'];
  modelSelection = new SelectionModel<Model>(false, []);

  scopes: SelectItem[] = [
      { value: 'GLOBAL', viewValue: 'GLOBAL' },
      { value: 'GATEWAY', viewValue: 'GATEWAY' }
  ];

  inputTypes: SelectItem[] = [
      { value: 'int', viewValue: 'int' },
      { value: 'float', viewValue: 'float' },
      { value: 'string', viewValue: 'string' },
      { value: 'image', viewValue: 'image' },
      { value: 'audio', viewValue: 'audio' }
  ];

  @ViewChild(MatSort, { static: false }) sort: MatSort;

  @Input() gatewayId: string;

  /**
   *
   * @param graphService
   * @param formBuilder
   * @param _snackBar
   */
  constructor(private graphService: GraphService,
    private formBuilder: FormBuilder,
    private _snackBar: MatSnackBar) {

  }

  /**
   *
   */
  ngOnInit() {

      this.modelSelection.clear();

      this.createForm();


      this.onFormChanges();

      console.log('Getting models');

      this.getModels(this.gatewayId);

  }

  /**
   *
   */
  ngAfterViewInit() {
      this.modelsDataSource.sort = this.sort;
  }

  /**
   *
   * @param filterValue
   */
  applyFilter(target: EventTarget | null) {
      if (target){
          const htmlTextArea = target as HTMLTextAreaElement;
          this.modelsDataSource.filter = htmlTextArea.value.trim().toLowerCase();
      }
  }

  /**
   * Creates the model form
   */
  createForm() {
      this.modelForm = this.formBuilder.group({
          uid: ['', Validators.required],
          uuid: ['', Validators.required],
          name: ['', Validators.required],
          description: ['', Validators.required],
          inputType: ['', Validators.required],
          url: ['', Validators.required],
          scope: ['', Validators.required],
          inputTemplate: ['', Validators.required]
      });
  }

  /**
   * Gets a gateway and all the models associated with it
   * @param gatewayId - the gateway identifier
   */
  public getModels(gatewayId: string) {
      console.log('Getting gateway and models for: ', gatewayId);

      this.graphService.getModels(gatewayId)
          .subscribe(res => {
              console.log('Received response for graphService.getModels: ', res);
              this.modelsDataSource.data = res as Model[];

              this.graphAddOpDisabled = true;
              this.graphUpdateOpDisabled = true;
              this.graphDeleteOpDisabled = true;
          });
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
      // const numSelected = this.modelSelection.selected.length;
      // const numRows = this.modelsDataSource.data.length;
      // return numSelected === numRows;
      return false;
  }

  /**
   * Function called when a model table row is selected
   * @param row - the table row object. It maps to a Model object.
   */
  onModelClicked(row) {

      console.log('Row clicked: ', row);

      this.modelSelection.select(row);

      const model = row;
      let scope = model.scope;
      if (scope != 'GLOBAL') {
          scope = 'GATEWAY';
      }

      this.modelForm.patchValue({
          uid: model.uid,
          uuid: model.uuid,
          name: model.name,
          description: model.description,
          inputType: model.inputType,
          url: model.url,
          scope: scope,
          inputTemplate: atob(model.inputTemplate),
      });

      this.graphDeleteOpDisabled = false;
      this.graphAddOpDisabled = true;
      this.graphUpdateOpDisabled = true;
  }

  /**
   * Reset model form
   */
  resetmodelForm() {
      this.modelForm.reset({
      }, { emitEvent: false });

      this.graphDeleteOpDisabled = true;
      this.graphAddOpDisabled = true;
      this.graphUpdateOpDisabled = true;

      this.modelSelection.clear();
  }

  /**
   * Add a model object to the graph data store
   */
  addModel() {
      const ts = Date.now();
      const model = new Model();

      let scope = this.modelForm.get('scope').value;
      if (scope != 'GLOBAL') {
          scope = this.gatewayId;
      }
      model.scope = scope;

      model.created = ts;
      model.modified = ts;
      model.uuid = this.modelForm.get('name').value;
      model.name = this.modelForm.get('name').value;
      model.description = this.modelForm.get('description').value;
      model.inputType = this.modelForm.get('inputType').value;
      model.url = this.modelForm.get('url').value;
      model.inputTemplate = btoa(this.modelForm.get('inputTemplate').value);

      console.log('Adding model with uuid: ', model.uuid);
    

      // First check that model with the same name already exist
      if (this.modelExist(model.uuid)) {

          this._snackBar.open('Model name is not unique.', 'Cancel', {
              duration: 3000,
          });
      }
      else {
          this.graphService.addModel(0, model)
              .subscribe(res => {
                  console.log('Result from add model', res);

                  this.getModels(this.gatewayId);
                  this.resetmodelForm();
              });
      }

  }

  /**
   * Updates the model on the graph data store
   */
  updateModel() {

      console.log('Inside updateModel function');

      const ts = Date.now();
      const model = new Model();

      let scope = this.modelForm.get('scope').value;
      if (scope != 'GLOBAL') {
          scope = this.gatewayId;
      }
      model.scope = scope;

      model.modified = ts;
      model.uid = this.modelForm.get('uid').value;
      model.uuid = this.modelForm.get('name').value;
      model.name = this.modelForm.get('name').value;
      model.description = this.modelForm.get('description').value;
      model.inputType = this.modelForm.get('inputType').value;
      model.url = this.modelForm.get('url').value;
      model.inputTemplate = btoa(this.modelForm.get('inputTemplate').value);

      console.log('Update model to url: ', model.url);
      console.log('Update model to inputTemplate: ', model.inputTemplate);
    
      this.graphService.updateModel(model)
          .subscribe(res => {
              console.log('Result from update model', res);

              this.getModels(this.gatewayId);
              this.resetmodelForm();
          });
  }


  /**
   * Deletes the model from the graph data store
   */
  deleteModel() {
      const modelUid = this.modelForm.get('uid').value;
      console.log('deleting model: ', modelUid);


      this.graphService.deleteModel(0, this.modelForm.get('uid').value)
          .subscribe(res => {
              console.log('Result from delete model ', res);

              this.getModels(this.gatewayId);
              this.resetmodelForm();

          });
  }

  /**
   * Fucntion called when the form changes
   */
  onFormChanges(): void {
      this.modelForm.valueChanges.subscribe(val => {

          if (this.modelForm.dirty) {

              this.graphDeleteOpDisabled = true;
              this.graphAddOpDisabled = false;

              if (this.modelSelection.hasValue()) {
                  this.graphUpdateOpDisabled = false;
              }
              else {
                  this.graphUpdateOpDisabled = true;
              }
          }

      });
  }

  modelExist(uuid: string): boolean {
      let found = false;

      this.modelsDataSource.data.forEach(
          model => {

              if (model.uuid == uuid) {
                  found = true;
              }
          }
      );

      return found;
  }

}

