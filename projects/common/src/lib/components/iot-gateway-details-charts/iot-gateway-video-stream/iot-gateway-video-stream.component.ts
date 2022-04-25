import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { Device, Resource, TSReading, TSCombinedReading } from '../../../models/iot.model';
import { GraphService } from '../../../services/graph/graph.service';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl, FormGroup } from '@angular/forms';

declare var JSMpeg:any

@Component({
    selector: 'app-common-iot-gateway-video-stream',
    templateUrl: './iot-gateway-video-stream.component.html',
    styleUrls: ['./iot-gateway-video-stream.component.css']
})
export class CommonIotGatewayVideoStreamComponent implements OnInit, OnDestroy, AfterViewInit {
  device: Device;
  instrument: Resource;
  imageData = '';
  inferredImageData = '';
  resourceReadings = [];
  queryForm: FormGroup = new FormGroup ({
    pickerStartDate: new FormControl(''),
    pickerEndDate: new FormControl('')
  })
  queryLastValuesDisabled = true;
  queryByDateDisabled = true;
  resourceInferredReadings = [];
  resourceCombinedReadings: TSCombinedReading[] = []
  subscriptions: Subscription[] = [];
  displayedColumns = ['created', 'inferredValue']
  dateFormat = 'yyyy-MM-dd HH:mm:ss'
  tableDataSource = new MatTableDataSource<TSCombinedReading>();
  combinedReadingSelection = new SelectionModel<TSCombinedReading>(false, []);

  commandForm = new FormGroup({
      command: new FormControl('')
  });

  @ViewChild('streaming', {static: false}) canvas: ElementRef; 

  constructor(private graphService: GraphService) { }

  ngOnInit(): void {
      
  }

  ngOnDestroy(): void {

  }

  ngAfterViewInit(): void {
    var urlString = 'ws://localhost:9999';

    var player = new JSMpeg.Player(urlString, 
      {canvas: this.canvas.nativeElement, autoplay: true, audio: false, loop: true });
  }


}
