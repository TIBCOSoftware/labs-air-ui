import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-pipeline-rest-broadcast',
  templateUrl: './pipeline-rest-broadcast.component.html',
  styleUrls: ['./pipeline-rest-broadcast.component.css']
})
export class PipelineRestBroadcastComponent implements OnInit {

  @Input() restBroadcastForm: FormGroup;

  constructor() { }

  ngOnInit(): void {
  }

}
