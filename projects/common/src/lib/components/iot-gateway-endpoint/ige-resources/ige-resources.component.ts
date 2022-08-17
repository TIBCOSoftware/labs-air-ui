import { SelectionModel } from '@angular/cdk/collections';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormArray, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { PythonResource,  } from '@TIBCOSoftware/labs-air-graph-client';
import {ProxyService} from "common";

@Component({
  selector: 'app-ige-resources',
  templateUrl: './ige-resources.component.html',
  styleUrls: ['./ige-resources.component.css']
})
export class IgeResourcesComponent implements OnInit {

  @Input() gatewayId: string;
  @ViewChild('fileInput') fileInput: ElementRef;
  resourcesDataSource = new MatTableDataSource<PythonResource>();
  dateFormat = 'yyyy-MM-dd  HH:mm:ss'
  resourceDisplayedColumns = ['created', 'name', 'id', 'type']
  resourceSelection = new SelectionModel<PythonResource>(false, []);
  resourceForm: UntypedFormGroup = new UntypedFormGroup({
    name: new UntypedFormControl,
    type: new UntypedFormControl,
    fileContent: new UntypedFormControl,
    uuid: new UntypedFormControl,
    created: new UntypedFormControl,
    modified: new UntypedFormControl,
    inputs: new UntypedFormArray([]),
    outputs: new UntypedFormArray([]),
    filePath: new UntypedFormControl()
  });
  types = [
    { value: 'requirement', viewValue: 'Requirement' },
    { value: 'processor', viewValue: 'Processor' },
    { value: 'dockerfile', viewValue: 'Dockerfile'},
    { value: 'file', viewValue: 'File'},
    { value: 'folder', viewValue: 'Folder'}
  ];
  languages = ['python'];
  showFileUpload = true;
  code = ''

  constructor(private graphService: ProxyService, private _snackBar: MatSnackBar) { }

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
      fileContent: row.fileContent,
      uuid: row.uuid,
      created: row.created,
      modified: row.modified,
      scope: row.scope,
      filePath: row.filePath
    });
    if (row.inputs) {
      const decodedInputs = JSON.parse(atob(row.inputs));
      const inputs = new UntypedFormArray(decodedInputs.map(x => new UntypedFormControl(x)));
      this.resourceForm.setControl('inputs', inputs);
    }
    if (row.outputs) {
      const decodedOutputs = JSON.parse(atob(row.outputs))
      const outputs = new UntypedFormArray(decodedOutputs.map(x => new UntypedFormControl(x)));
      this.resourceForm.setControl('outputs', outputs)
    }
    this.code = atob(row.fileContent);
    this.resourceSelection.select(row);
  }

  get inputs (): UntypedFormArray {
   return this.resourceForm.get('inputs') as UntypedFormArray;
  }

  get inputArray(): [UntypedFormControl] {
    return this.inputs.controls as [UntypedFormControl];
  }

  get outputs (): UntypedFormArray {
    return this.resourceForm.get('outputs') as UntypedFormArray;
  }

  get outputArray(): [UntypedFormControl] {
    return this.outputs.controls as [UntypedFormControl]
  }

  addResource() {
    const ts = Date.now();
    const resource = {} as PythonResource;

    resource.scope = this.gatewayId as PythonResource.ScopeEnum;

    resource.created = ts;
    resource.modified = ts;
    resource.name = this.resourceForm.get('name').value;
    resource.type = this.resourceForm.get('type').value;
    resource.fileContent = this.resourceForm.get('fileContent').value;
    resource.inputs = btoa(JSON.stringify(this.inputs.getRawValue()));
    resource.outputs = btoa(JSON.stringify(this.outputs.getRawValue()));
    resource.filePath = this.resourceForm.get('filePath').value;
    if (this.resourceExists(resource.name)) {
        this._snackBar.open('Resource name is not unique.', 'Cancel', {
            duration: 3000,
        });
    }
    else {
      this.graphService.addPythonResource(this.gatewayId, resource)
        .subscribe(res => {
          this.getResources();
          this.resetResource();
          this.fileInput.nativeElement.value = '';
        });
    }
    this.code = '';
    this.showFileUpload = true;
  }

  updateResource() {
    const ts = Date.now();
    const resource = {} as PythonResource;

    resource.created = this.resourceForm.get('created').value;
    resource.modified = ts;
    resource.name = this.resourceForm.get('name').value;
    resource.uuid = this.resourceForm.get('uuid').value;
    resource.type = this.resourceForm.get('type').value;
    resource.scope = this.gatewayId as PythonResource.ScopeEnum;
    resource.fileContent = this.resourceForm.get('fileContent').value;
    resource.inputs = btoa(JSON.stringify(this.inputs.getRawValue()));
    resource.outputs = btoa(JSON.stringify(this.outputs.getRawValue()));
    resource.filePath = this.resourceForm.get('filePath').value;
    this.graphService.updatePythonResource(resource).subscribe(
      resp => {
        this.getResources();
        this.resetResource();
      }
    )
  }

  deleteResource() {
    this.graphService.deletePythonResource(this.resourceForm.get('uuid').value).subscribe(
      () => {
        this.getResources();
        this.resetResource();
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
    this.showFileUpload = false;
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
    fileReader.onload = () => { 
      this.resourceForm.patchValue({
        fileContent: fileReader.result.toString().split(',')[1]
      })
      this.code = atob(fileReader.result.toString().split(',')[1]);
    };
    fileReader.readAsDataURL(inputEvent.files.item(0));
  }

  resetResource() {
    this.resourceForm.reset();
    this.resourceForm.setControl('inputs', new UntypedFormArray([]));
    this.resourceForm.setControl('outputs', new UntypedFormArray([]));
    this.resourceSelection.clear();
  }

  addIO(io: string): void {
    io == 'inputs' ? this.inputs.push(new UntypedFormControl ('')) : this.outputs.push(new UntypedFormControl(''));
  }

  removeIO(io: string, index: number): void {
    io == 'inputs' ? this.inputs.removeAt(index) : this.outputs.removeAt(index);
  }

  onTypeChange(type: string) {
    if (type = 'Folder') {
      this.showFileUpload = true;
    }
  }
 
}
