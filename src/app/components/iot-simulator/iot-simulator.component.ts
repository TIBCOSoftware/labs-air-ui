import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { GraphService } from '../../services/graph/graph.service'
import { Notification } from '../../shared/models/iot.model';
import {MatSort} from '@angular/material/sort';

import { RtsfSimulatorService } from '../../services/simulator/rtsf-simulator.service';

@Component({
  selector: 'app-iot-simulator',
  templateUrl: './iot-simulator.component.html',
  styleUrls: ['./iot-simulator.component.css']
})
export class IotSimulatorComponent implements OnInit, AfterViewInit {

  @ViewChild(MatSort) sort: MatSort;

  basketOpened = false;
  itemSelected = false;
  showCameraImage = false;
  showScanImage = false;
  showScaleSelector = false;
  showScanSelector = false;
  showCameraSelector = false;

  scannedItem: string = "";
  itemWeight = 0;
  cameraItem: string = "";

  dateFormat = 'yyyy-MM-dd  HH:mm:ss'

  notificationsDataSource = new MatTableDataSource<Notification>();
  notificationDisplayedColumns: string[] = ['level', 'description', 'created'];

  productList: any[] = [];

  constructor(private simulatorService: RtsfSimulatorService,
    private _snackBar: MatSnackBar,
    private graphService: GraphService) { }

  ngOnInit(): void {

    this.getProducts();
    this.getNotifications();
  }


  ngAfterViewInit(): void {
    this.notificationsDataSource.sort = this.sort;
  }

  getProducts() {
    this.simulatorService.getProducts()
      .subscribe(res => {

        this.productList = res.Data;
        console.log("Products returned: ", this.productList);

      })
  }

  scanEvent() {
    console.log("Scan Event");
    if (this.basketOpened) {
      this.scannedItem = "";
      this.showScanSelector = true;
    }
    else {
      this._snackBar.open("Failure", "Please open basket to start", {
        duration: 3000,
      });
    }
  }

  scanCanceled() {
    this.scannedItem = "";
    this.showScanSelector = false;
  }

  scanSelected() {

    this.showScanSelector = false;
    this.showScanImage = true;

    let event = {
      "EventTime": Date.now(),
      "Details": {
        "Action": "process-item",
        "BasketID": "abc-012345-def",
        "CustomerID": "joe5",
        "EmployeeID": "mary1",
        "ProductID": this.scannedItem
      }
    };


    this.simulatorService.posEvent(event)
      .subscribe(res => {
        console.log("Scan submitted: ", res);

        this._snackBar.open("Success", "Item scanned", {
          duration: 3000,
        });
      })
  }


  scaleEvent() {

    console.log("Scale Event");
    if (this.basketOpened) {
      this.itemWeight = 0;
      this.showScaleSelector = true;
    }
    else {
      this._snackBar.open("Failure", "Please open basket to start", {
        duration: 3000,
      });
    }

  }

  scaleCanceled() {
    this.itemWeight = 0;
    this.showScaleSelector = false;
  }

  scaleSelected() {
    this.showScaleSelector = false;
    console.log("Item has been weighted: ", this.itemWeight);

    let event = {
      "EventTime": Date.now(),
      "Details": {
        "Action": "process-item",
        "LaneID": "1",
        "Weight": this.itemWeight
      }
    };

    this.simulatorService.scaleEvent(event)
      .subscribe(res => {
        console.log("Weight submitted: ", res);

        this._snackBar.open("Success", "Item weighted", {
          duration: 3000,
        });
      });


  }

  cameraEvent() {

    console.log("Camera Event");
    if (this.basketOpened) {
      this.cameraItem = "";
      this.showCameraImage = false;
      this.showCameraSelector = true;
    }
    else {
      this._snackBar.open("Failure", "Please select item", {
        duration: 3000,
      });
    }


  }

  cameraCanceled() {

    this.cameraItem = "";
    this.showCameraSelector = false;

  }

  cameraSelected() {

    this.showCameraSelector = false;
    this.showCameraImage = true;
    console.log("Photo taken for: ", this.cameraItem);

    let event = {
      "EventTime": Date.now(),
      "Details": {
        "Action": "process-item",
        "LaneID": "1",
        "ROI": "Bagging Area",
        "ProductID": this.cameraItem
      }
    };

    this.simulatorService.roiEvent(event)
      .subscribe(res => {
        console.log("Photo submitted: ", res);

        this._snackBar.open("Success", "Video submitted", {
          duration: 3000,
        });
      });

  }

  paymentEvent() {

    console.log("Payment Event");
    if (this.basketOpened) {

      this.showCameraImage = false;
      this.showScanImage = false;
      this.itemWeight = 0;

      let event = {
        "EventTime": Date.now(),
        "Details": {
          "Action": "payment-success",
          "LaneID": "1",
          "BasketID": "abc-012345-def",
          "CustomerID": "joe5",
          "EmployeeID": "mary1"
        }
      };

      this.simulatorService.posEvent(event)
        .subscribe(res => {
          console.log("Payment submitted: ", res);

          this._snackBar.open("Success", "Payment accepted", {
            duration: 3000,
          });
        });
    }
    else {
      this._snackBar.open("Failure", "Please open basket to start", {
        duration: 3000,
      });
    }



  }

  closeBasketEvent() {
    console.log("Close Basket Event");

    if (this.basketOpened) {
      this.itemSelected = false;
      this.basketOpened = false;
      this.showCameraImage = false;
      this.showScanImage = false;
      this.itemWeight = 0;

      let event = {
        "EventTime": Date.now(),
        "Details": {
          "Action": "basket-close",
          "LaneID": "1",
          "BasketID": "abc-012345-def",
          "CustomerID": "joe5",
          "EmployeeID": "mary1"
        }
      };

      this.simulatorService.posEvent(event)
        .subscribe(res => {
          console.log("OpenBasket submitted: ", res);

          this._snackBar.open("Success", "Basket is closed", {
            duration: 3000,
          });
        });
    }
    else {
      this._snackBar.open("Success", "Basket is already closed", {
        duration: 3000,
      });
    }

  }

  openBasketEvent() {
    console.log("Open Basket Event");

    this.basketOpened = true;
    this.showCameraImage = false;
    this.showScanImage = false;
    this.itemWeight = 0,
    this.scannedItem = "";
    this.cameraItem = "";


    let event = {
      "EventTime": Date.now(),
      "Details": {
        "Action": "basket-open",
        "LaneID": "1",
        "BasketID": "abc-012345-def",
        "CustomerID": "joe5",
        "EmployeeID": "mary1"
      }
    };

    this.simulatorService.posEvent(event)
      .subscribe(res => {
        console.log("OpenBasket submitted: ", res);

        this._snackBar.open("Success", "Basket is opened", {
          duration: 3000,
        });

      });
  }

  getNotifications() {
    this.graphService.getNotifications()
      .subscribe(res => {
        this.notificationsDataSource.data = res as Notification[];
      })
  }

}
