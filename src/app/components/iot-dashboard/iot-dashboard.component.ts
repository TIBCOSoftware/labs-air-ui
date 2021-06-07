import { Component, OnInit } from '@angular/core';
import { SpotfireCustomization } from '@tibco/spotfire-wrapper';

import { SpotfireDashboardComponent } from '../spotfire-dashboard/spotfire-dashboard.component';

@Component({
  selector: 'app-iot-dashboard',
  templateUrl: './iot-dashboard.component.html',
  styleUrls: ['./iot-dashboard.component.css']
})
export class IotDashboardComponent implements OnInit {

  // Spotfire configuration
  public spotfireServer: string;
  public analysisPath: string;
  public version: string;
  public allowedPages: string[];
  public activePage: string;
  public markingOn = {};
  public markingName: string;
  public parameters: string;
  public configuration: SpotfireCustomization;

  constructor() { }

  ngOnInit() {

    // this.spotfireServer = 'https://spotfire-next.cloud.tibco.com';
    // this.analysisPath = '/Samples/Introduction to Spotfire';
    // this.activePage = '0';
    // this.parameters = "Test";
    // this.configuration = {
    //   showAbout: false,
    //   showAnalysisInformationTool: false,
    //   showAuthor: false,
    //   showClose: false,
    //   showCustomizableHeader: false,
    //   showDodPanel: false,
    //   showExportFile: false,
    //   showFilterPanel: true,
    //   showHelp: false,
    //   showLogout: false,
    //   showPageNavigation: true,
    //   showStatusBar: false,
    //   showToolBar: false,
    //   showUndoRedo: false
    // };

    // https://spotfire-next.cloud.tibco.com/spotfire/wp/analysis?file=/Users/b5zl5zgs2jshn2xyyess4gzqufcuue6q/Public/Product%20Registration%2006


    // this.spotfireServer = 'https://spotfire-next.cloud.tibco.com';
    // this.analysisPath = '/Users/b5zl5zgs2jshn2xyyess4gzqufcuue6q/Public/Product Registration 06';

    // Works for Anomaly Detection
    // this.spotfireServer = 'https://ec2-3-223-106-221.compute-1.amazonaws.com';
    // this.analysisPath = '/Anonymous/MSAnomalyDetection';
    // this.version = '10.7'

    // https://demo.spotfire.cloud.tibco.com/spotfire/wp/analysis?file=/Public/Working%20Demos/Wafermap%20Pattern%20Recognition%20-%20Air%20Demo&waid=QHnEu1TdLku_b9yhuVaq3-120416f172FBqm&wavid=0

    // this.spotfireServer = 'https://demo.spotfire.cloud.tibco.com';
    // this.analysisPath = '/Public/Working Demos/Wafermap Pattern Recognition-Air Demo';

    this.spotfireServer = 'https://spotfire-next.cloud.tibco.com';
    this.analysisPath = '/Users/vioijfozulumlardrxcikq7xtczlfcrk/Public/AirDashboard';
    // this.version = '11.0'

    this.activePage = '0';
    this.parameters = "Test";
    this.configuration = {
      showAbout: false,
      showAnalysisInformationTool: false,
      showAuthor: false,
      showClose: false,
      showCustomizableHeader: false,
      showDodPanel: false,
      showExportFile: false,
      showFilterPanel: true,
      showHelp: false,
      showLogout: false,
      showPageNavigation: true,
      showStatusBar: false,
      showToolBar: false,
      showUndoRedo: false
    };
  }

  public marking(data) {
    console.log("marking: ", data)
  }

}
