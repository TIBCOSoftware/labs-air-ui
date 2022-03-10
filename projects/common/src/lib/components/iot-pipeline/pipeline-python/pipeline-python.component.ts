import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { GraphService } from '../../../services/graph/graph.service';
import { PythonResource } from '../../../models/iot.model';
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
  

  constructor(private graphService: GraphService) { }

  ngOnInit(): void {
    this.getResources();
  }

  getResources() {
    this.graphService.getResources(this.gatewayId).subscribe(resp => {
      this.splitResources(resp);
    })
  }

  splitResources(resources: PythonResource[]) {
    this.resources.processors = resources.filter(resource => resource.type === 'processor');
    this.resources.requirements = resources.filter(resource => resource.type === 'requirement');
    this.resources.dockerfile = resources.filter(resource => resource.type === 'dockerfile')
  }

}
