import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-pipeline-request-reply',
  templateUrl: './pipeline-request-reply.component.html',
  styleUrls: ['./pipeline-request-reply.component.css']
})
export class PipelineRequestReplyComponent implements OnInit {

  @Input() requestReplyForm: FormGroup 

  constructor() { }

  ngOnInit(): void {
  }

}
