import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { RtsfSimulatorService } from '../../services/simulator/rtsf-simulator.service';

@Component({
  selector: 'app-iot-simulator',
  templateUrl: './iot-simulator.component.html',
  styleUrls: ['./iot-simulator.component.css']
})
export class IotSimulatorComponent implements OnInit {

  basketOpened = false;
  itemSelected = false;
  showCameraImage = false;
  showScanImage = false;
  showScale = false;
  showItemSelector = false;
  showCamera = false;

  selectedItem: string = "";
  scannedItem: string = "";
  itemWeight: string = "0";
  cameraItem: string = "";

  productList: any[] = [];

  constructor(private simulatorService: RtsfSimulatorService,
    private _snackBar: MatSnackBar) { }

  ngOnInit(): void {

    this.getProducts();
  }

  getProducts() {
    this.simulatorService.getProducts()
      .subscribe(res => {

        this.productList = res.Data;
        console.log("Products returned: ", this.productList);

      })
  }

  selectItemEvent() {
    console.log("Select Item Event");
    if (this.basketOpened) {
      this.selectedItem = "";
      this.showItemSelector = true;
    }
    else {
      this._snackBar.open("Failure", "Please open basket to start", {
        duration: 3000,
      });
    }
  }


  selectItemCanceled() {
    this.selectedItem = "";
    this.showItemSelector = false;
  }

  selectItemSelected() {
    this.showItemSelector = false;
    this.itemSelected = true;
    console.log("Item has been selected: ", this.selectedItem);

    this._snackBar.open("Success", "Item placed in basket", {
      duration: 3000,
    });
  }


  scanEvent() {

    console.log("Scan Event");
    if (this.itemSelected) {
      this.scannedItem = this.selectedItem;
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
    else {
      this._snackBar.open("Failure", "Please select item", {
        duration: 3000,
      });
    }

  }

  scaleEvent() {

    console.log("Scale Event");
    if (this.itemSelected) {
      this.itemWeight = "0";
      this.showScale = true;
    }
    else {
      this._snackBar.open("Failure", "Please place item on scale", {
        duration: 3000,
      });
    }

  }

  scaleCanceled() {
    this.itemWeight = "0"
    this.showScale = false;
  }

  scaleSelected() {
    this.showScale = false;
    console.log("Item has been weighted: ", this.itemWeight);

    let event = {
      "EventTime": Date.now(),
      "Details": {
        "Action": "process-item",
        "LaneID": "1",
        "Weight": Number(this.itemWeight)
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
    if (this.itemSelected) {
      this.cameraItem = "";
      this.showCameraImage = false;
      this.showCamera = true;
    }
    else {
      this._snackBar.open("Failure", "Please select item", {
        duration: 3000,
      });
    }


  }

  cameraCanceled() {

    this.cameraItem = "";
    this.showCamera = false;

  }

  cameraSelected() {

    this.showCamera = false;
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

  }

  openBasketEvent() {
    console.log("Open Basket Event");

    this.basketOpened = true;
    this.itemSelected = false;
    this.showCameraImage = false;
    this.showScanImage = false;
    this.selectedItem = "";
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

}
