import { Component, OnInit } from '@angular/core';
import { SpotfireCustomization} from '@tibco/spotfire-wrapper';

@Component({
  selector: 'app-iot-anomaly-detection-dashboard',
  templateUrl: './iot-anomaly-detection-dashboard.component.html',
  styleUrls: ['./iot-anomaly-detection-dashboard.component.css']
})
export class IotAnomalyDetectionDashboardComponent implements OnInit {

  // Spotfire configuration
  public spotfireServer: string;
  public analysisPath: string;
  public allowedPages: string[];
  public activePage: string;
  public markingOn = {};
  public markingName: string;
  public parameters: string;
  public configuration: SpotfireCustomization;

  constructor() { }

  ngOnInit() {

    this.spotfireServer = 'https://ec2-3-223-106-221.compute-1.amazonaws.com';
    // this.analysisPath = '/Anonymous/air_postgres_dashboard_v1.0';
    this.analysisPath = '/Anonymous/AIRModelScoredData';
    // this.spotfireServer = 'https://spotfire-next.cloud.tibco.com';
    // this.analysisPath = '/Users/b5zl5zgs2jshn2xyyess4gzqufcuue6q/Public/Product Registration 06';
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
