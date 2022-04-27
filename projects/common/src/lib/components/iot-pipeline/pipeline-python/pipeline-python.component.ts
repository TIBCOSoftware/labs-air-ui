import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { GraphService } from '@TIBCOSoftware/labs-air-graph-client';
import { PythonResource } from '@TIBCOSoftware/labs-air-graph-client';
@Component({
  selector: 'app-pipeline-python',
  templateUrl: './pipeline-python.component.html',
  styleUrls: ['./pipeline-python.component.css']
})
export class PipelinePythonComponent implements OnInit {

  @Input() pythonForm: FormGroup;
  @Input() gatewayId: string;
  resources: {
    processors: PythonResource[],
    requirements: PythonResource[],
    dockerfile: PythonResource[]
  } = { processors: [], requirements: [], dockerfile: []}
  resourceContent: string;
  showResourceContentBoolean = false;
  languages = ['python'];


  constructor(private graphService: GraphService) { }

  ngOnInit(): void {
    this.getResources();
  }

  getResources() {
    this.graphService.getPythonResources(this.gatewayId).subscribe(resp => {
      this.splitResources(resp);
    })
  }

  splitResources(resources: PythonResource[]) {
    this.resources.processors = resources.filter(resource => resource.type === 'processor');
    this.resources.requirements = resources.filter(resource => resource.type === 'requirement');
    this.resources.dockerfile = resources.filter(resource => resource.type === 'dockerfile')
  }

  updateContent(event: string, file: string) {
    const fileContent = this.resources[file].find(resource => resource.uid == event).fileContent;
    const fieldName = file === 'dockerfile' ? 'dockerfileContent' : file.slice(0, -1)+'Content';
    this.pythonForm.get(fieldName).setValue(fileContent);
  }

  showResourceContent(uid: string, resourceType: string) {
    if (uid){ 
      this.resourceContent = decodeURIComponent(this.resources[resourceType].find(resource => resource.uid == uid).fileContent);
      this.showResourceContentBoolean = true;
    }
  }
}
