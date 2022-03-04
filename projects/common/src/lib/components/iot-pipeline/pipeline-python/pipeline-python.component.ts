import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
@Component({
  selector: 'app-pipeline-python',
  templateUrl: './pipeline-python.component.html',
  styleUrls: ['./pipeline-python.component.css']
})
export class PipelinePythonComponent implements OnInit {

  @Input() pipelineForm: FormGroup;

  constructor() { }

  ngOnInit(): void {
  }

}
