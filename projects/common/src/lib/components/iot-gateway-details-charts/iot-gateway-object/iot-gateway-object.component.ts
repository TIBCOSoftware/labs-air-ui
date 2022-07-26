import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { Device, Resource, TSCombinedReading } from '../../../models/iot.model';
import { GraphService } from '@TIBCOSoftware/labs-air-graph-client';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Reading } from '@TIBCOSoftware/labs-air-graph-client';

@Component({
    selector: 'app-common-iot-gateway-object',
    templateUrl: './iot-gateway-object.component.html',
    styleUrls: ['./iot-gateway-object.component.css']
})
export class CommonIotGatewayObjectComponent implements OnInit, OnDestroy, AfterViewInit {
  device: Device;
  instrument: Resource;
  objectData = '';
  inferredObjectData = '';
  resourceReadings = [];
  queryForm: UntypedFormGroup = new UntypedFormGroup ({
    pickerStartDate: new UntypedFormControl(''),
    pickerEndDate: new UntypedFormControl('')
  })
  queryLastValuesDisabled = true;
  queryByDateDisabled = true;
  resourceInferredReadings = [];
  resourceCombinedReadings: TSCombinedReading[] = []
  subscriptions: Subscription[] = [];
  streaming = false;
  displayedColumns = ['created', 'value', 'inferredValue']
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

      this.graphService.getReadings('0', this.device.name, this.instrument.name, 30)
          .subscribe(res => {
              this.resourceReadings = res as Reading[];

              if (this.resourceReadings.length > 0) {
                  this.getResourceInferredReadings(this.device.name, this.instrument.name + '_Inferred', this.resourceReadings.length);
              }
          });
  }

  getResourceInferredReadings(deviceName, resourceName, numReadings) {
      this.graphService.getReadings('0',deviceName, resourceName, numReadings)
          .subscribe(res => {
              this.resourceInferredReadings = res as Reading[];

              this.setresourceCombinedReadings();

          });
  }

  getStreamingReadings() {
      this.subscriptions.push(this.graphService.getReadings('0', this.device.name, this.instrument.name, 1)
          .subscribe(res => {
              this.resourceReadings = res as Reading[];

              if (this.resourceReadings.length > 0) {
                  this.getStreamingResourceInferredReadings(this.device.name, this.instrument.name + '_Inferred', 1, this.resourceReadings[0].created);
                  this.setStreamingObjectData();
              }
          }));
  }

  getStreamingResourceInferredReadings(deviceName, resourceName, numReadings, ts) {
      this.subscriptions.push(this.graphService.getReadingsAt(deviceName, resourceName, ts)
          .subscribe(res => {
              this.resourceInferredReadings = res as Reading[];
              this.inferredObjectData = '';
              this.setStreamingInferredObjectData();
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
              // Decode value if encoded
              if (this.isBase64(reading.value)) {
                this.resourceCombinedReadings.push({
                    created: reading.created,
                    value: atob(reading.value),
                    inferredValue: 'N/A'
                });
              }
              else {
                this.resourceCombinedReadings.push({
                    created: reading.created,
                    value: reading.value,
                    inferredValue: 'N/A'
                });
              }

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

      this.setObjectData(row);

      this.setInferredObjectData(row);

  }

  public setInferredObjectData(row) {
      this.inferredObjectData = row.inferredValue;
  }

  public setObjectData(row) {
      this.objectData = row.value;
  }

  public setStreamingObjectData() {
      this.objectData = this.resourceReadings[0].value;
  }

  public setStreamingInferredObjectData() {
      if (this.resourceInferredReadings.length > 0) {
          console.log('Encoded inferred reading: ', this.resourceInferredReadings[0].value);
          console.log('Decoded inferred reading: ', atob(this.resourceInferredReadings[0].value));

          this.inferredObjectData = atob(this.resourceInferredReadings[0].value);
      }
      else {
          this.inferredObjectData = '';
      }

  }

  isBase64(encodedString) {
    const regexBase64 = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
    return regexBase64.test(encodedString);   // return TRUE if its base64 string.
  }
}
