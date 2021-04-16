import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pipeline-flogo-flow',
  templateUrl: './pipeline-flogo-flow.component.html',
  styleUrls: ['./pipeline-flogo-flow.component.css']
})
export class PipelineFlogoFlowComponent implements OnInit {

  @Input() flogoFlowForm: FormGroup;
  
  constructor() { }

  ngOnInit(): void {
  }

}
