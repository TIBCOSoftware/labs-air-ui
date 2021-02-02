import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { GraphService } from '../../services/graph/graph.service';
import { Notification } from '../../shared/models/iot.model';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-iot-notifications',
  templateUrl: './iot-notifications.component.html',
  styleUrls: ['./iot-notifications.component.css']
})
export class IotNotificationsComponent implements OnInit, AfterViewInit {

  dateFormat = 'yyyy-MM-dd  HH:mm:ss'

  notificationsDataSource = new MatTableDataSource<Notification>();
  notificationDisplayedColumns: string[] = ['uuid', 'gateway', 'source', 'device', 'resource', 'value', 'level', 'description', 'created'];
  notificationSelection = new SelectionModel<Notification>(false, []);

  @ViewChild(MatSort, { static: false }) sort: MatSort;

  constructor(private graphService: GraphService) { }

  ngOnInit() {
    this.getNotifications();
  }

  ngAfterViewInit() {
    this.notificationsDataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    this.notificationsDataSource.filter = filterValue.trim().toLowerCase();
  }

  getNotifications() {
    console.log("Getting Gateways called")

    this.graphService.getNotifications()
      .subscribe(res => {

        // this.gatewayList = [];
        this.notificationsDataSource.data = res as Notification[];

        console.log("Notifications Received: ", this.notificationsDataSource.data);
      })
  }

  onNotificationClicked(row) {

    console.log('Row clicked: ', row);

  }

}
