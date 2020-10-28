import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EdgeService } from '../../services/edge/edge.service';
import { GraphService } from '../../services/graph/graph.service';
import { Device, TSReading, Resource, Gateway, ModelConfig } from '../../shared/models/iot.model';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

export interface SelectItem {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-iot-ml-models',
  templateUrl: './iot-ml-models.component.html',
  styleUrls: ['./iot-ml-models.component.css']
})
export class IotMlModelsComponent implements OnInit {
  dateFormat = 'yyyy-MM-dd  HH:mm:ss'

  // Form variables
  modelForm: FormGroup;

  gatewayList: Gateway[] = [];
  selectedGateway = null as Gateway;

  modelConfigsDataSource = new MatTableDataSource<ModelConfig>();
  modelConfigDisplayedColumns: string[] = ['id', 'name', 'description', 'created', 'modified'];
  modelConfigSelection = new SelectionModel<ModelConfig>(false, []);

  devicesDataSource = new MatTableDataSource<Device>();
  conditionResourcesDataSource = new MatTableDataSource<Resource>();
  actionResourcesDataSource = new MatTableDataSource<Resource>();

  mlmodels: SelectItem[] = [
    { value: 'ms|anomaly_detection|AnomalyDetection', viewValue: 'Anomaly Detection' },
    { value: 'nvidia|image_recognition|alexnet', viewValue: 'Object Detection - AlexNet' },
    { value: 'nvidia|image_recognition|googlenet', viewValue: 'Object Detection - GoogleNet' },
    { value: 'nvidia|image_recognition|googlenet-12', viewValue: 'Object Detection - GoogleNet-12' },
    { value: 'nvidia|image_recognition|resnet-18', viewValue: 'Object Detection - Resnet-18' },
    { value: 'nvidia|image_recognition|resnet-50', viewValue: 'Object Detection - Resnet-50' },
    { value: 'nvidia|image_recognition|resnet-101', viewValue: 'Object Detection - Resnet-101' },
    { value: 'nvidia|image_recognition|resnet-152', viewValue: 'Object Detection - Resnet-152' },
    { value: 'nvidia|image_recognition|vgg-16', viewValue: 'Object Detection - VGG-16' },
    { value: 'nvidia|image_recognition|vgg-19', viewValue: 'Object Detection - VGG-19' },
    { value: 'nvidia|image_recognition|inception_v4', viewValue: 'Object Detection - Inception-v4' },
    { value: 'tfserving|image_recognition|rcnnresnet', viewValue: 'Object Detection - RCNN Resnet' },
    { value: 'tfserving|image_recognition|resnet', viewValue: 'Object Detection - Resnet' },
    { value: 'tfserving|image_recognition|inception', viewValue: 'Object Detection - Imagenet Inception' }
  ];



  @ViewChild(MatSort, { static: false }) sort: MatSort;

  constructor(private edgeService: EdgeService,
    private graphService: GraphService,
    private formBuilder: FormBuilder,
    private _snackBar: MatSnackBar) { }

  ngOnInit() {
    this.modelForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: [''],
      device: ['', Validators.required],
      resource: ['', Validators.required],
      model: ['', Validators.required],
      created: [''],
      modified: [''],
      uid: ['']
    });

    // this.setCondConpareNewMetricToValueValidators();
    // this.setCondConpareNewMetricToLastMetricValidators();
    // this.setCondConpareLastMetricToValueValidators();
    // this.setActionSendNotificationValidators();
    // this.setActionSendCommandValidators();

    this.getGateways();

  }

  ngAfterViewInit() {
    this.devicesDataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    this.modelConfigsDataSource.filter = filterValue.trim().toLowerCase();
  }

  getGateways() {
    console.log("Getting Gateways called")

    this.graphService.getGateways()
      .subscribe(res => {

        // this.gatewayList = [];
        this.gatewayList = res;
        console.log("Gateways Returned: ", res);

        console.log("Updated gateway list: ", this.gatewayList);
      })
  }

  public getModelConfigs(gateway) {

    this.graphService.getModelConfigs(gateway.uuid)
      .subscribe(res => {
        this.modelConfigsDataSource.data = res as ModelConfig[];

        console.log("Rules received: ", this.modelConfigsDataSource.data)
      })
  }

  public getDevices(gateway) {
    this.edgeService.getDevices(gateway)
      .subscribe(res => {
        this.devicesDataSource.data = res as Device[];

        console.log("Devices received: ", this.devicesDataSource.data)
      })
  }

  onGatewaySelected(event) {
    console.log("onGatewayelected: ", event);

    this.selectedGateway = this.gatewayList[event.value];

    console.log("Gateway selected: ", this.selectedGateway);

    this.getModelConfigs(this.selectedGateway);

    this.getDevices(this.selectedGateway);
  }

  onModelConfigClicked(row) {

    console.log('Row clicked: ', row);

    this.modelConfigSelection.select(row);

    // Set the resourceDataSource
    let idx = this.getIndexForDeviceDataSource(row.condDevice);
    this.conditionResourcesDataSource.data = this.devicesDataSource.data[idx].profile.deviceResources as Resource[];

    idx = this.getIndexForDeviceDataSource(row.actionDevice);
    this.actionResourcesDataSource.data = this.devicesDataSource.data[idx].profile.deviceResources as Resource[];

    // Update Instrument Form
    this.modelForm.reset({
      name: row.name,
      description: row.description,
      device: row.device,
      resource: row.resource,
      model: row.model,
      created: row.created,
      modified: row.modified,
      uid: row.uid
    }, { emitEvent: true });

  }

  onDeviceSelected(event) {

    console.log('Condition Device Selected: ', event);

    // Set the resourceDataSource
    let idx = this.getIndexForDeviceDataSource(event.value);
    this.conditionResourcesDataSource.data = this.devicesDataSource.data[idx].profile.deviceResources as Resource[];
  }


  onResourceSelected(event) {

  }


  resetModelForm() {
    console.log("Resetting modelConfig form");

    this.modelForm.reset({
    }, { emitEvent: false });

    console.log("Form after resetting: ", this.modelForm);

  }

  addModelConfig() {
    console.log("Adding modelConfig");

    let ts = Date.now();
    let modelConfig = new ModelConfig();
    modelConfig.name = this.modelForm.controls['name'].value;
    modelConfig.uuid = this.modelForm.controls['name'].value;
    modelConfig.description = this.modelForm.controls['description'].value;
    modelConfig.device = this.modelForm.controls['device'].value;
    modelConfig.resource = this.modelForm.controls['resource'].value;
    modelConfig.model = this.modelForm.controls['model'].value;
    modelConfig.created = ts;
    modelConfig.modified = ts;

    this.graphService.addModelConfig(this.selectedGateway.uid, modelConfig)
      .subscribe(res => {
        console.log("Result from add modelConfig to dgraph", res);

        this.getModelConfigs(this.selectedGateway);
        this.resetModelForm();
      });
  }

  updateModelConfig() {
    console.log("Inside updateModelConfig function");

    let ts = Date.now();
    let modelConfig = new ModelConfig();
    modelConfig.name = this.modelForm.controls['name'].value;
    modelConfig.uuid = this.modelForm.controls['name'].value;
    modelConfig.description = this.modelForm.controls['description'].value;
    modelConfig.device = this.modelForm.controls['device'].value;
    modelConfig.resource = this.modelForm.controls['resource'].value;
    modelConfig.model = this.modelForm.controls['model'].value;
    modelConfig.uid = this.modelForm.controls['uid'].value;
    modelConfig.modified = ts;

    this.graphService.updateModelConfig(modelConfig)
      .subscribe(res => {
        console.log("Result from update dgraph", res);

        this.getModelConfigs(this.selectedGateway);
        this.resetModelForm();
      });
  }

  deleteModelConfig() {
    this.graphService.deleteModelConfig(this.selectedGateway.uid, this.modelForm.controls['uid'].value)
      .subscribe(res => {
        console.log("Result from delete ", res);

        this.getModelConfigs(this.selectedGateway);
        this.resetModelForm();

      });
  }

  getIndexForDeviceDataSource(name: string): number {
    let idx = 0;

    for (let i = 0; i < this.devicesDataSource.data.length; i++) {

      if (this.devicesDataSource.data[i].name == name) {
        idx = i;
        break;
      }
    }

    return idx;
  }


  onFormChanges(): void {
    this.modelForm.valueChanges.subscribe(val => {
      console.log("Form has changed for: ", val.name);

      if (this.modelForm.dirty) {
        console.log("form is dirty");
      }

    });
  }

  setCondConpareNewMetricToValueValidators() {
    const condCompareNewMetricToValueOpControl = this.modelForm.get('condCompareNewMetricToValueOp');
    const condCompareNewMetricValueControl = this.modelForm.get('condCompareNewMetricValue');

    this.modelForm.get('condCompareNewMetricToValue').valueChanges
      .subscribe(compareToValue => {

        if (compareToValue) {
          console.log("setting validator for compare to value");
          condCompareNewMetricToValueOpControl.setValidators([Validators.required]);
          condCompareNewMetricValueControl.setValidators([Validators.required]);
        }
        else {
          console.log("clearing validator for action notification");
          condCompareNewMetricToValueOpControl.setValidators(null);
          condCompareNewMetricValueControl.setValidators(null);
        }

        condCompareNewMetricToValueOpControl.updateValueAndValidity();
        condCompareNewMetricValueControl.updateValueAndValidity();
      });

  }

  setCondConpareNewMetricToLastMetricValidators() {
    const condCompareNewMetricToLastMetricOpControl = this.modelForm.get('condCompareNewMetricToLastMetricOp');

    this.modelForm.get('condCompareNewMetricToLastMetric').valueChanges
      .subscribe(compareToLastValue => {

        if (compareToLastValue) {
          console.log("setting validator for compare to value");
          condCompareNewMetricToLastMetricOpControl.setValidators([Validators.required]);
        }
        else {
          console.log("clearing validator for action notification");
          condCompareNewMetricToLastMetricOpControl.setValidators(null);
        }

        condCompareNewMetricToLastMetricOpControl.updateValueAndValidity();
      });
  }

  setCondConpareLastMetricToValueValidators() {
    const condCompareLastMetricToValueOpControl = this.modelForm.get('condCompareLastMetricToValueOp');
    const condCompareLastMetricValueControl = this.modelForm.get('condCompareLastMetricValue');

    this.modelForm.get('condCompareLastMetricToValue').valueChanges
      .subscribe(compareToValue => {

        if (compareToValue) {
          console.log("setting validator for compare to value");
          condCompareLastMetricToValueOpControl.setValidators([Validators.required]);
          condCompareLastMetricValueControl.setValidators([Validators.required]);
        }
        else {
          console.log("clearing validator for action notification");
          condCompareLastMetricToValueOpControl.setValidators(null);
          condCompareLastMetricValueControl.setValidators(null);
        }

        condCompareLastMetricToValueOpControl.updateValueAndValidity();
        condCompareLastMetricValueControl.updateValueAndValidity();
      });

  }

  setActionSendNotificationValidators() {
    const actionNotificationControl = this.modelForm.get('actionNotification');

    this.modelForm.get('actionSendNotification').valueChanges
      .subscribe(sendNotification => {

        if (sendNotification) {
          console.log("setting validator for action notification");
          actionNotificationControl.setValidators([Validators.required]);
        }
        else {
          console.log("clearing validator for action notification");
          actionNotificationControl.setValidators(null);
        }

        actionNotificationControl.updateValueAndValidity();
      });
  }

  setActionSendCommandValidators() {
    const actionDeviceControl = this.modelForm.get('actionDevice');
    const actionResourceControl = this.modelForm.get('actionResource');
    const actionValueControl = this.modelForm.get('actionValue');

    this.modelForm.get('actionSendCommand').valueChanges
      .subscribe(sendCommand => {

        if (sendCommand) {
          console.log("setting validator for command fields");
          actionDeviceControl.setValidators([Validators.required]);
          actionResourceControl.setValidators([Validators.required]);
          actionValueControl.setValidators([Validators.required]);
        }
        else {
          console.log("clearing validator for command fields");
          actionDeviceControl.setValidators(null);
          actionResourceControl.setValidators(null);
          actionValueControl.setValidators(null);
        }

        actionDeviceControl.updateValueAndValidity();
        actionResourceControl.updateValueAndValidity();
        actionValueControl.updateValueAndValidity();
      });
  }


  deployModelConfig() {

    let ts = Date.now();
    let modelConfig = new ModelConfig();
    modelConfig.name = this.modelForm.controls['name'].value;
    modelConfig.uuid = this.modelForm.controls['name'].value;
    modelConfig.description = this.modelForm.controls['description'].value;
    modelConfig.device = this.modelForm.controls['device'].value;
    modelConfig.resource = this.modelForm.controls['resource'].value;
    modelConfig.model = this.modelForm.controls['model'].value;
    modelConfig.created = ts;
    modelConfig.modified = ts;

    this.edgeService.addModelConfig(this.selectedGateway, modelConfig)
      .subscribe(res => {
        console.log("Result from adding modelConfig: ", res);

        let message = 'Success'
        if (res == undefined) {
          message = 'Failure';
        }

        this._snackBar.open(message, "Deploy ModelConfig", {
          duration: 3000,
        });

      });
  }


  undeployModelConfig() {
    let ts = Date.now();
    let modelConfig = new ModelConfig();
    modelConfig.name = this.modelForm.controls['name'].value;
    modelConfig.uuid = this.modelForm.controls['name'].value;
    modelConfig.description = this.modelForm.controls['description'].value;
    modelConfig.device = this.modelForm.controls['device'].value;
    modelConfig.resource = this.modelForm.controls['resource'].value;
    modelConfig.model = this.modelForm.controls['model'].value;
    modelConfig.created = ts;
    modelConfig.modified = ts;

    this.edgeService.deleteModelConfig(this.selectedGateway, modelConfig)
      .subscribe(res => {
        console.log("Result from deleting modelConfig: ", res);

        let message = 'Success'
        if (res == undefined) {
          message = 'Failure';
        }

        this._snackBar.open(message, "Undeploy ModelConfig", {
          duration: 3000,
        });

      });

  }

}
