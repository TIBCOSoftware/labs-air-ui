import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Notification } from '@TIBCOSoftware/labs-air-graph-client';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import {ProxyService} from "../../services/graph/proxy.service";

@Component({
    selector: 'app-common-iot-notifications',
    templateUrl: './iot-notifications.component.html',
    styleUrls: ['./iot-notifications.component.css']
})
export class CommonIotNotificationsComponent implements OnInit, AfterViewInit {

  dateFormat = 'yyyy-MM-dd  HH:mm:ss'

  notificationsDataSource = new MatTableDataSource<Notification>();
  notificationDisplayedColumns: string[] = ['uuid', 'gateway', 'source', 'device', 'resource', 'level', 'description', 'created'];
  notificationSelection = new SelectionModel<Notification>(false, []);
  selectedNotification: Notification;

  @ViewChild(MatSort, { static: false }) sort: MatSort;

  constructor(private graphService: ProxyService) { }

  ngOnInit() {
      this.getNotifications();
  }

  ngAfterViewInit() {
      this.notificationsDataSource.sort = this.sort;
  }

  applyFilter(target: EventTarget | null) {
      if (target){
          const htmlTextArea = target as HTMLTextAreaElement;
          this.notificationsDataSource.filter = htmlTextArea.value.trim().toLowerCase();
      }
  }

  getNotifications() {
      console.log('Getting Gateways called');

      this.graphService.getNotifications()
          .subscribe(res => {

              // this.gatewayList = [];

              res.forEach(notification => {
                  notification.value = this.decodeIfBase64(notification.value)
              })

              this.notificationsDataSource.data = res as Notification[]

              console.log('Notifications Received: ', this.notificationsDataSource.data);
          });
  }

  onNotificationClicked(row) {
      console.log('Row clicked: ', row);
      this.notificationSelection.select(row);
      this.selectedNotification = row;
  }

  decodeIfBase64(encodedString) {
    const regexBase64 = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
    if (regexBase64.test(encodedString)) {
        return atob(encodedString);
    } else {
        return encodedString;
    }
  }

}
