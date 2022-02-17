import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { Device, Resource, TSReading, TSCombinedReading } from '../../../models/iot.model';
import { GraphService } from '../../../services/graph/graph.service';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
    selector: 'app-common-iot-gateway-image',
    templateUrl: './iot-gateway-image.component.html',
    styleUrls: ['./iot-gateway-image.component.css']
})
export class CommonIotGatewayImageComponent implements OnInit, OnDestroy, AfterViewInit {
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
  streaming = false;
  displayedColumns = ['created', 'inferredValue']
  dateFormat = 'yyyy-MM-dd HH:mm:ss'
  tableDataSource = new MatTableDataSource<TSCombinedReading>();
  combinedReadingSelection = new SelectionModel<TSCombinedReading>(false, []);


  @ViewChild(MatSort) sort: MatSort;

  constructor(private graphService: GraphService) { }

  ngOnInit(): void {
      this.getReadings();
  }

  ngOnDestroy(): void {
      this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngAfterViewInit(): void {
      this.tableDataSource.sort = this.sort;
  }

  startDateEvent(event){}

  endDateEvent(event){}

  onQueryByDateClicked(){}

  getReadings() {

      this.combinedReadingSelection.clear();

      this.graphService.getReadings(this.device.name, this.instrument.name, 30)
          .subscribe(res => {
              this.resourceReadings = res as TSReading[];

              if (this.resourceReadings.length > 0) {
                  this.getResourceInferredReadings(this.device.name, this.instrument.name + '_Inferred', this.resourceReadings.length);
              }
          });
  }

  getResourceInferredReadings(deviceName, resourceName, numReadings) {
      this.graphService.getReadings(deviceName, resourceName, numReadings)
          .subscribe(res => {
              this.resourceInferredReadings = res as TSReading[];

              this.setresourceCombinedReadings();

          });
  }

  getStreamingReadings() {
      this.subscriptions.push(this.graphService.getReadings(this.device.name, this.instrument.name, 1)
          .subscribe(res => {
              this.resourceReadings = res as TSReading[];

              if (this.resourceReadings.length > 0) {
                  this.getStreamingResourceInferredReadings(this.device.name, this.instrument.name + '_Inferred', 1, this.resourceReadings[0].created);
                  this.setStreamingImageData();
              }
          }));
  }

  getStreamingResourceInferredReadings(deviceName, resourceName, numReadings, ts) {
      this.subscriptions.push(this.graphService.getReadingsAt(deviceName, resourceName, ts)
          .subscribe(res => {
              this.resourceInferredReadings = res as TSReading[];
              this.inferredImageData = '';
              this.setStreamingInferredImageData();
          }));
  }

  toggleChart() {
      // Remove subscription when going from streaming to non-streaming
      // Add subscribtion when going from non-streaming to streaming by calling
      // getStreamingReading
      if (this.streaming) {
          this.subscriptions.forEach(sub => sub.unsubscribe());
          this.getReadings();
      }
      else {
          this.getStreamingReadings();
      }

      this.streaming = !this.streaming;
  }

  setresourceCombinedReadings() {
      this.resourceCombinedReadings = [];

      this.resourceReadings.forEach(
          reading => {
              this.resourceCombinedReadings.push({
                  created: reading.created,
                  value: reading.value,
                  inferredValue: 'N/A'
              });
          }
      );

      this.resourceCombinedReadings.forEach(
          reading => {

              for (let i = 0; i < this.resourceInferredReadings.length; i++) {
                  if (reading.created == this.resourceInferredReadings[i].created) {
                      reading.inferredValue = atob(this.resourceInferredReadings[i].value);
                      break;
                  }
              }
          }
      );

      console.log('Combined Readings: ', this.resourceCombinedReadings);


      this.tableDataSource.data = this.resourceCombinedReadings;

      const numReadings = this.resourceCombinedReadings.length;
      if (numReadings > 0) {
          this.dataSelected(this.resourceCombinedReadings[numReadings - 1]);

          console.log('Selecting first row: ', this.resourceCombinedReadings[numReadings - 1]);

      }
  }

  dataSelected(row) {
      console.log('Row clicked: ', row);

      this.combinedReadingSelection.select(row);

      this.setImageData(row);

      this.setInferredImageData(row);

  }

  public setInferredImageData(row) {
      this.inferredImageData = row.inferredValue;
  }

  public setImageData(row) {
      this.imageData = row.value;
  }

  public setStreamingImageData() {
      this.imageData = this.resourceReadings[0].value;
  }

  public setStreamingInferredImageData() {
      if (this.resourceInferredReadings.length > 0) {
          console.log('Encoded inferred reading: ', this.resourceInferredReadings[0].value);
          console.log('Decoded inferred reading: ', atob(this.resourceInferredReadings[0].value));

          this.inferredImageData = atob(this.resourceInferredReadings[0].value);
      }
      else {
          this.inferredImageData = '';
      }

  }
}
