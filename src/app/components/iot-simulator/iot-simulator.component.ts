import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { request } from 'http';

@Component({
  selector: 'app-iot-simulator',
  templateUrl: './iot-simulator.component.html',
  styleUrls: ['./iot-simulator.component.css']
})
export class IotSimulatorComponent implements OnInit {

  scanURL = "";
  cameraURL = "";
  scaleURL = "";
  openCartURL = "";
  closeCartURL = ""
  paymentURL = ""

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
  }

  sendRequest(whichURL: string, requestBody: string) {
    return this.http.post(whichURL, JSON.stringify(requestBody)).subscribe(response => {
      console.log(response);
    })
  }

}
