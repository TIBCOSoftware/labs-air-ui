import { SelectionModel } from '@angular/cdk/collections';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { PythonResource,  } from '@TIBCOSoftware/labs-air-graph-client';
import { GraphService } from '@TIBCOSoftware/labs-air-graph-client';

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
    fileContent: new FormControl,
    uid: new FormControl,
    created: new FormControl,
    modified: new FormControl
  });
  types = [
    { value: 'requirement', viewValue: 'Requirement' },
    { value: 'processor', viewValue: 'Processor' },
    { value: 'dockerfile', viewValue: 'Dockerfile'}
  ];
  languages = ['python'];

  constructor(private graphService: GraphService, private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.resourceSelection.clear();
    this.getResources();
  }

  getResources() {
    this.graphService.getPythonResources(this.gatewayId).subscribe(resp => {
      this.resourcesDataSource.data = resp;
    });
  }

  onResourceClicked(row: PythonResource) {
    this.resourceForm.patchValue({
      name: row.name,
      type: row.type,
      fileContent: decodeURIComponent(row.fileContent),
      uid: row.uid,
      created: row.created,
      modified: row.modified,
      scope: row.scope
    })
    this.resourceSelection.select(row);
  }

  addResource() {
    const ts = Date.now();
    const resource = {} as PythonResource;

    resource.scope = this.gatewayId as PythonResource.ScopeEnum;

    resource.created = ts;
    resource.modified = ts;
    resource.name = this.resourceForm.get('name').value;
    resource.type = this.resourceForm.get('type').value;
    resource.fileContent = encodeURIComponent(this.resourceForm.get('fileContent').value);

    if (this.resourceExists(resource.name)) {
        this._snackBar.open('Resource name is not unique.', 'Cancel', {
            duration: 3000,
        });
    }
    else {
      this.graphService.addPythonResource(resource)
        .subscribe(res => {
          this.getResources();
          this.resetResource();
        });
    }
  }

  updateResource() {
    const ts = Date.now();
    const resource = {} as PythonResource;

    resource.created = this.resourceForm.get('created').value;
    resource.modified = ts;
    resource.name = this.resourceForm.get('name').value;
    resource.uid = this.resourceForm.get('uid').value;
    resource.type = this.resourceForm.get('type').value; 
    resource.scope = this.gatewayId as PythonResource.ScopeEnum;
    resource.fileContent = encodeURIComponent(this.resourceForm.get('fileContent').value);
    this.graphService.updatePythonResource(resource).subscribe(
      resp => {
        this.getResources();
      }
    )
  }
  
  deleteResource() {
    this.graphService.deletePythonResource(this.gatewayId, this.resourceForm.get('uid').value).subscribe(
      resp => {
        this.getResources();
      }
    );
  }

  resourceExists(name: string): boolean {
    let found = false;
    this.resourcesDataSource.data.forEach(
        resource => {
            if (resource.name == name) {
                found = true;
            }
        }
    );
    return found;
  }

  onFileUpload(input: Event) {
    const inputElement = input.target as HTMLInputElement;
    const file = inputElement.files.item(0);
    // if (file.type && file.type == 'text/x-python-script') {
    //   this.resourceForm.patchValue({ type: 'processor' });
    //   this.readFile(inputElement);
    // } else if (file.name.match('(?:^|\W)dockerfile(?:$|\W)')) {
    //   this.resourceForm.patchValue({ type: 'dockerfile' });
    //   this.readFile(inputElement);
    // } else if (file.name == "requirement.txt") {
    //   this.resourceForm.patchValue({ type: 'requirement'});
    //   this.readFile(inputElement);
    // } else {
    //   this._snackBar.open('Resource file is not supported.', 'Cancel', {
    //     duration: 3000,
    // });
    // }
    this.readFile(inputElement);
  }

  readFile(inputEvent: HTMLInputElement) {
    const fileReader = new FileReader();
    fileReader.onload = () => { this.resourceForm.patchValue({
      fileContent: fileReader.result.toString()
    })};
    fileReader.readAsText(inputEvent.files.item(0), 'utf-8');
  }

  resetResource() {
    this.resourceForm.reset();
    this.resourceSelection.clear();
  }
 
}
