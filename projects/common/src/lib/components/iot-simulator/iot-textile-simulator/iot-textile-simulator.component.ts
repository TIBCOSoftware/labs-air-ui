import { Component, OnInit } from '@angular/core';
import { ChartType, ChartConfiguration, ChartData } from 'chart.js';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TextileSimulatorService } from '../../../services/simulator/textile-simulator.service';
import { GraphService } from '../../../services/graph/graph.service';
import { Notification } from '../../../models/iot.model';
import { MatTableDataSource } from '@angular/material/table';

export class DefectInfo {
  created: number;
  defect: string;
  frameURL: string;
}

export class StatisticInfo {
  Count: number;
  Filter: string;
  Label: string;
  TestID: string;
}

@Component({
    selector: 'app-common-iot-textile-simulator',
    templateUrl: './iot-textile-simulator.component.html',
    styleUrls: ['./iot-textile-simulator.component.css']
})
export class CommonIotTextileSimulatorComponent implements OnInit {

  dateFormat = 'yyyy-MM-dd  HH:mm:ss';

  testIdPrefix = 'tddsim_';
  testIdCount = 0;
  testId = 'tddsim_1629815904584';

  notifications: Notification[] = [];
  defectsDataSource = new MatTableDataSource<DefectInfo>();
  defectsDisplayedColumns: string[] = ['created', 'defect', 'frameURL'];

  // #52D726), Middle Yellow (#FFEC00), Philippine Orange (#FF7300), Red (#FF0000), Blue Cola (#007ED6) and Middle Blue (#7CDDDD).
  currentDefect: string;

  pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: ''
      }
    }
  };
  pieChartData: ChartData<'pie'> = {
    datasets: [
      {
        data: [],
        backgroundColor: ['#52D726', '#FFEC00', '#FF7300', '#FF0000', '#007ED6', '#7CDDDD', '#aa3500']
      }
    ],
    labels: [],
  };
  pieChartType: ChartType = 'pie';
  pieChartLegend = true;
  pieChartPlugins = [];
  chartData = [];

  constructor(private simulatorService: TextileSimulatorService,
    private graphService: GraphService,
    private _snackBar: MatSnackBar) {

  }

  ngOnInit(): void {
      this.currentDefect = '*';
      // this.getStatistics();
  }

  playVideo(): void {
      // HTTP Callback to show the user has clicked the video to play it
      console.log('Send request to backend');

      // Update test count and testId
      this.testIdCount = Date.now();
      this.testId = this.testIdPrefix + this.testIdCount;


      // Calling video service
      const event = {
          'source': {
              'uri': 'file:///home/video-analytics-serving/data/textile.mp4',
              'type': 'uri'
          },
          'destination': {
              'metadata': {
                  'type': 'mqtt',
                  'path': '/tmp/results.jsonl',
                  'format': 'json-lines',
                  'host': 'mqtt:1883',
                  'topic': 'vaserving'
              }
          }, 'tags': {
              'target_defect': this.currentDefect,
              'test_id': this.testId
          },
          'parameters': {
              'file-location': '/home/ubuntu/vas/video-analytics-serving/frame_store/%08d.jpg'
          }
      };

      this.simulatorService.videoEvent(event)
          .subscribe(res => {
              console.log('Video submitted: ', res);

              this._snackBar.open('Success', 'Streaming Video', {
                  duration: 3000,
              });
          });
  }

  handleAction(action: string) {
      // HTTP Callback to detect which is the selected action

      console.log('Current action: ', action);

      console.log('Current defect: ', this.currentDefect);

  }

  handleRefresh() {
      // function to refresh the table

      this.getNotifications();


      this.getStatistics();

  }

  handleChartData(): void {
    this.pieChartData.datasets[0].data = [];
    this.pieChartData.labels = [];
    this.chartData.forEach(dataSet => {
      this.pieChartData.labels.push(dataSet.Label);
      this.pieChartData.datasets[0].data.push(dataSet.Count);
    });
    this.pieChartOptions.plugins.title.text = this.testId;
  }

  getNotifications() {

      const tableData = [];
      this.graphService.getNotifications()
          .subscribe(res => {
              this.notifications = res as Notification[];

              this.notifications.forEach(notification => {

                  // console.log("Notification: ", notification.description);

                  const splittedDesc = notification.description.split(',');

                  const numDesc = splittedDesc.length;

                  if (numDesc > 3) {

                      const descTestId = splittedDesc[3].split(' : ');

                      if (descTestId[1] == this.testId) {
                          const defect = splittedDesc[0].split(' : ');
                          const frameUrl = splittedDesc[2].substring(13, splittedDesc[2].length);

                          // console.log("FrameUrl value:", frameUrl);
                          // console.log("Defect:", defect[1]);

                          tableData.push({ created: notification.created, defect: defect[1], frameURL: frameUrl });
                      }


                  }



              });

              // console.log("Table data: ", tableData)

              this.defectsDataSource.data = tableData as DefectInfo[];

          });
  }

  getStatistics() {

      this.simulatorService.getStatistics(this.testId, this.currentDefect)
          .subscribe(res => {

              this.chartData = res.Data;

              console.log('Statistics: ', this.chartData);

              this.handleChartData();

          });

  }
}
