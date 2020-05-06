import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-data-streaming-view',
  templateUrl: './data-streaming-view.component.html',
  styleUrls: ['./data-streaming-view.component.css']
})
export class DataStreamingViewComponent implements OnInit {

  @Input() streamingForm: FormGroup;
  
  constructor() { }

  ngOnInit() {
  }

}
