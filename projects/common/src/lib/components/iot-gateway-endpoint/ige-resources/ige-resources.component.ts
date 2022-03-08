import { SelectionModel } from '@angular/cdk/collections';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { PythonResource } from '../../../models/iot.model';
import { GraphService } from '../../../services/graph/graph.service';

@Component({
  selector: 'app-ige-resources',
  templateUrl: './ige-resources.component.html',
  styleUrls: ['./ige-resources.component.css']
})
export class IgeResourcesComponent implements OnInit {

  @Input() gatewayId: string;
  resourcesDataSource = new MatTableDataSource<PythonResource>();
  dateFormat = 'yyyy-MM-dd  HH:mm:ss'
  resourceDisplayedColumns = ['created', 'name', 'id', 'type']
  resourceSelection = new SelectionModel<PythonResource>(false, []);
  resourceForm: FormGroup = new FormGroup({
    name: new FormControl,
    type: new FormControl,
    fileContent: new FormControl
  });
  currentSelection: PythonResource;
  types = [
    { value: 'requirement', viewValue: 'Requirement' },
    { value: 'processor', viewValue: 'Processor' },
    { value: 'dockerfile', viewValue: 'Dockerfile'}
];

  constructor(private graphService: GraphService, private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.getResources();

  }

  getResources() {
    this.graphService.getResources(this.gatewayId).subscribe(resp => {
      this.resourcesDataSource.data = resp;
    });
  }

  onResourceClicked(row: PythonResource) {
    this.resourceForm.patchValue({
      name: row.name,
      type: row.type,
      fileContent: row.fileContent
    })

    this.currentSelection = row;
  }

  addResource() {
    const ts = Date.now();
    const resource = new PythonResource();

    resource.scope = this.gatewayId;

    resource.created = ts;
    resource.modified = ts;
    resource.uuid = this.resourceForm.get('name').value;
    resource.name = this.resourceForm.get('name').value;
    resource.type = this.resourceForm.get('type').value;
    resource.fileContent = this.resourceForm.get('fileContent').value;

    if (this.resourceExists(resource.uuid)) {
        this._snackBar.open('Model name is not unique.', 'Cancel', {
            duration: 3000,
        });
    }
    else {
        this.graphService.addResource(resource)
            .subscribe(res => {
                this.getResources();
                // this.resetmodelForm();
            });
    }
  }

  updateResource() {
    const ts = Date.now();
    const resource = new PythonResource();

    resource.created = this.currentSelection.created;
    resource.fileContent = this.resourceForm.get('fileContent').value;
    resource.modified = ts;
    resource.name = this.resourceForm.get('name').value;
    resource.uuid = this.resourceForm.get('name').value;
    resource.uid = this.currentSelection.uid;
    resource.scope = this.currentSelection.scope;
    resource.type = this.resourceForm.get('type').value;

    this.graphService.updateResource(resource).subscribe(
      resp => {
        this.getResources();
      }
    )
  }
  
  deleteResource() {
    this.graphService.deleteResource(this.gatewayId, this.currentSelection.uid).subscribe(
      resp => {
        this.getResources();
      }
    );
  }

  resourceExists(uuid: string): boolean {
    let found = false;
    this.resourcesDataSource.data.forEach(
        resource => {
            if (resource.uuid == uuid) {
                found = true;
            }
        }
    );
    return found;
  }  
 
}
