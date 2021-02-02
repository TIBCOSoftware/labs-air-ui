import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, Input } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';

import { SelectionModel } from '@angular/cdk/collections';

import { Pipeline, DataStore, Protocol, Gateway, Device } from '../../shared/models/iot.model';
import { GraphService } from '../../services/graph/graph.service';
import { EdgeService } from '../../services/edge/edge.service';
import { FlogoDeployService } from '../../services/deployment/flogo-deploy.service';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { switchMap, debounceTime, distinctUntilChanged, startWith, tap, delay } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatStepper } from '@angular/material/stepper';
import { MatTableDataSource } from '@angular/material/table';


export interface SelectItem {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-iot-data-pipeline',
  templateUrl: './iot-data-pipeline.component.html',
  styleUrls: ['./iot-data-pipeline.component.css']
})
export class IotDataPipelineComponent implements OnInit, AfterViewInit {

  // Form variables
  pipelineForm: FormGroup;
  transportForm: FormGroup;
  dataStoreForm: FormGroup;
  filteringForm: FormGroup;
  streamingForm: FormGroup;

  transportViewForm: FormGroup;
  dataStoreViewForm: FormGroup;
  filteringViewForm: FormGroup;
  streamingViewForm: FormGroup;

  pipelineType = "data"

  gatewayId = "";
  gateway = null as Gateway;
  pipelineSelected = false;  // Used to control the display of buttons
  hidePassword = true;
  dateFormat = 'yyyy-MM-dd  HH:mm:ss';

  undeployDisabled = true;
  deployDisabled = true;
  deleteDisabled = true;

  devices: Device[] = [];

  pipelinesDataSource = new MatTableDataSource<Pipeline>();
  pipelineDisplayedColumns: string[] = ['id', 'name', 'pipelineType', 'protocolType', 'dataStoreType', 'status', 'created', 'modified'];
  pipelineSelection = new SelectionModel<Pipeline>(false, []);

  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild('stepper', { static: false }) stepper: MatStepper;

  /**
   *
   */
  constructor(private graphService: GraphService,
    private edgeService: EdgeService,
    private flogoDeployService: FlogoDeployService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private _snackBar: MatSnackBar) {

  }

  /**
   *
   */
  ngOnInit() {

    this.gatewayId = this.route.snapshot.paramMap.get('gatewayId');

    this.createForms();

    this.onFormChanges();

    console.log("Getting pipelines");

    this.getGatewayAndPipelines(this.gatewayId);
  }

  /**
   *
   */
  ngAfterViewInit() {
    this.pipelinesDataSource.sort = this.sort;
  }

  /**
   *
   */
  applyFilter(filterValue: string) {
    this.pipelinesDataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   *
   */
  public getGatewayAndPipelines(gatewayId: string) {
    console.log("Getting gateway and pipelines for: ", gatewayId);

    this.graphService.getGatewayAndPipelines(gatewayId)
      .subscribe(res => {
        console.log("Received response for graphService.getGatewayAndPipelines: ", res);
        this.gateway = res[0] as Gateway;

        if (res[0].pipelines != undefined) {

          console.log("Setting pipelineDataSource.data fo incoming pipeline");


          this.pipelinesDataSource.data = res[0].pipelines as Pipeline[];

          console.log("Got Pipelines on pilpelinesDataSource.data: " + this.pipelinesDataSource.data.toString());
        }
        else {

          this.pipelinesDataSource = new MatTableDataSource<Pipeline>();

          console.log("Setting pipelineDataSource.data to null");
        }

        // Get Devices to be used for filtering
        this.getDevices(this.gateway);

      })
  }

  /**
   * Whether the number of selected elements matches the total number of rows.
   */
  isAllSelected() {
    // const numSelected = this.pipelineSelection.selected.length;
    // const numRows = this.pipelinesDataSource.data.length;
    // return numSelected === numRows;
    return false;
  }

  /**
   * Handles selection of pipeline on table
   */
  onPipelineClicked(row) {

    console.log('Row clicked: ', row);

    this.pipelineSelection.select(row);
    this.pipelineSelected = true;

    // Update Pipeline Form
    this.pipelineForm.reset({
      uid: row.uid,
      name: row.name,
      prototypeType: row.protocolType,
      dataStoreType: row.dataStoreType,
      status: row.status,
    }, { emitEvent: false });

    // Reset command buttons
    if (row.status == "Undeployed") {
      this.deployDisabled = false;
      this.undeployDisabled = true;

    }
    else {
      this.deployDisabled = true;
      this.undeployDisabled = false;
    }

    this.updateProtocolViewForm(row.protocolType, row.protocol);

    this.updateDataStoreViewForm(row.dataStoreType, row.dataStore);

    this.updateFilterViewForm(row.filter);

    this.updateStreamingViewForm(row.streaming)

  }

  /**
   *
   * @param protocolType
   * @param protocol
   */
  updateProtocolViewForm(protocolType, protocol) {

    if (protocolType == "MQTT") {

      let delimInd = protocol.brokerURL.lastIndexOf(":");

      let hostname = protocol.brokerURL.substring(6, delimInd);
      let port = protocol.brokerURL.substring(delimInd + 1);

      // console.log("BrokerURL parsing: ", delimInd, " ", hostname, " ", port);

      // Update protocol view form
      console.log("Setting transportviewform protocol to: ", protocolType);

      this.transportViewForm.patchValue({
        protocol: protocolType,
        protocolId: protocol.uuid,
        mqtt: {
          hostname: hostname,
          port: port,
          topic: protocol.topic,
          maximumQOS: protocol.maximumQOS,
          connectionTimeout: protocol.connectionTimeout,
          username: protocol.username,
          password: protocol.password,
          encryptionMode: protocol.encryptionMode,
          clientCertificate: protocol.clientCertificate,
          caCertificate: protocol.caCertificate,
          clientKey: protocol.clientKey
        }
      });

    }
    else if (protocolType == "Kafka") {

      let delimInd = protocol.brokerURL.lastIndexOf(":");
      let hostname = protocol.brokerURL.substring(0, delimInd);
      let port = protocol.brokerURL.substring(delimInd + 1);

      this.transportViewForm.patchValue({
        protocol: protocolType,
        protocolId: protocol.uuid,
        kafka: {
          hostname: hostname,
          port: port,
          topic: protocol.topic,
          consumerGroupId: protocol.consumerGroupId,
          connectionTimeout: protocol.connectionTimeout,
          sessionTimeout: protocol.sessionTimeout,
          initialOffset: protocol.initialOffset,
          retryBackoff: protocol.retryBackoff,
          fetchMinBytes: protocol.fetchMinBytes,
          fetchMaxWait: protocol.fetchMaxWait,
          commitInterval: protocol.commitInterval,
          heartbeatInterval: protocol.heartbeatInterval,
          authMode: protocol.authMode,
          username: protocol.username,
          password: protocol.password,
          clientCertificate: protocol.clientCertificate,
          serverCertificate: protocol.serverCertificate,
          clientKey: protocol.clientKey
        }
      });
    }

  }

  /**
   *
   * @param dataStoreType
   * @param dataStore
   */
  updateDataStoreViewForm(dataStoreType, dataStore) {

    if (dataStoreType == "Postgres") {

      // Update datastore view form
      this.dataStoreViewForm.patchValue({
        dataStore: dataStoreType,
        dataStoreId: dataStore.uuid,
        postgres: {
          host: dataStore.host,
          port: dataStore.port.toString(),
          databaseName: dataStore.databaseName,
          user: dataStore.user,
          password: dataStore.password
        }
      });
    }
    else if (dataStoreType == "Snowflake") {

      this.dataStoreViewForm.patchValue({
        dataStore: dataStoreType,
        dataStoreId: dataStore.uuid,
        snowflake: {
          accountName: dataStore.accountName,
          warehouse: dataStore.warehouse,
          database: dataStore.database,
          schema: dataStore.schema,
          authType: dataStore.authType,
          username: dataStore.username,
          password: dataStore.password,
          role: dataStore.role,
          clientId: dataStore.clientId,
          clientSecret: dataStore.clientSecret,
          authorizationCode: dataStore.authorizationCode,
          redirectURI: dataStore.redirectURI,
          loginTimeout: dataStore.loginTimeout
        }
      });
    }
    else if (dataStoreType == "TGDB") {

      this.dataStoreViewForm.patchValue({
        dataStore: dataStoreType,
        dataStoreId: dataStore.uuid,
        tgdb: {
          url: dataStore.url,
          username: dataStore.username,
          password: dataStore.password
        }
      });
    }
    else if (dataStoreType == "Dgraph") {

      this.dataStoreViewForm.patchValue({
        dataStore: dataStoreType,
        dataStoreId: dataStore.uuid,
        dgraph: {
          url: dataStore.url,
          username: dataStore.username,
          password: dataStore.password
        }

      });
    }

  }

  /**
   *
   * @param filter
   */
  updateFilterViewForm(filter) {


    // console.log("In updateFilterViewForm: ", filter);

    const devicesArray: FormArray = this.filteringViewForm.get('deviceNames') as FormArray;

    // Clear the array
    devicesArray.clear();

    var selDevices = filter.deviceNames.split(',');
    let status = false;

    console.log("In updateFilterViewForm: ", this.devices);

    this.devices.forEach((device) => {

      selDevices.forEach((selDevice) => {
        if (selDevice == device.name) {
          status = true;
          return;
        }
      })

      const control = new FormControl(status);
      devicesArray.push(control);
      status = false;
    });

  }

  /**
   *
   * @param streaming
   */
  updateStreamingViewForm(streaming) {

    // Update datastore view form
    this.streamingViewForm.patchValue({
      deviceName: streaming.deviceName,
      instrumentName: streaming.instrumentName,
      function: streaming.function,
      windowType: streaming.windowType,
      windowSize: streaming.windowSize
    });

  }

  /**
   *
   */
  resetPipelineForm() {
    this.pipelineForm.reset({
    }, { emitEvent: false });

  }

  /**
   *
   */
  updatePipeline() {

    console.log("Inside updatesubscription function");

    let ts = Date.now();
    let pl = new Pipeline();
    pl.name = this.pipelineForm.controls['name'].value;
    pl.protocolType = this.pipelineForm.controls['protocolType'].value;
    pl.dataStoreType = this.pipelineForm.controls['dataStoreType'].value;
    pl.created = this.pipelineForm.controls['created'].value;
    pl.status = this.pipelineForm.controls['status'].value;
    pl.modified = ts;
    pl.uid = this.pipelineForm.controls['uid'].value;

    this.graphService.updatePipeline(pl)
      .subscribe(res => {
        console.log("Result from update dgraph", res);

        this.getGatewayAndPipelines(this.gatewayId);
        this.resetPipelineForm();
      });
  }

  /**
   *
   */
  deletePipeline() {
    this.graphService.deletePipeline(this.gateway.uid, this.pipelineForm.controls['uid'].value)
      .subscribe(res => {
        console.log("Result from delete ", res);

        this.getGatewayAndPipelines(this.gatewayId);
        this.resetPipelineForm();

      });
  }

  /**
   *
   */
  onFormChanges(): void {
    this.pipelineForm.valueChanges.subscribe(val => {
      console.log("Form has changed for: ", val.name);

      if (this.pipelineForm.dirty) {
        console.log("form is dirty");

      }

    });
  }

  /**
   *
   */
  saveDataPipeline(deployPipeline: boolean) {
    console.log("Deploying pipeline");

    let protocol = this.transportForm.get('protocol').value;
    let dataStore = this.dataStoreForm.get('dataStore').value;
    let tsms = Date.now();

    let applicationId = "iot-data-" + tsms;
    let pipelineStatus = "Undeployed";

    // Check if deployment is needed
    if (deployPipeline) {

      let protocolObj = this.buildProtocolProperties(protocol, this.transportForm);
      let dataStoreObj = this.buildDataStoreProperties(dataStore, this.dataStoreForm);
      let filterObj = this.buildDataFilteringProperties(this.filteringForm);
      let streamingObj = this.buildStreamingProperties(this.streamingForm);

      let env = [];
      env.push({ "name": "FLOGO_APP_PROPS_ENV", "value": "auto" });
      protocolObj.forEach(function (protocol) {
        env.push(protocol);
      });
      dataStoreObj.forEach(function (datastore) {
        env.push(datastore);
      });
      filterObj.forEach(function (filter) {
        env.push(filter);
      });
      streamingObj.forEach(function (stream) {
        env.push(stream);
      });

      let request = {
        "id": applicationId,
        "name": "air-" + this.pipelineType + "-" + protocol.toLowerCase() + "-" + dataStore.toLowerCase(),
        "version": "0.1.0",
        "values": {
          "deployment": {
            "env": env
          }
        }
      }
      console.log("Deploy Request: " + JSON.stringify(request));

      console.log("Deploying for protocol: " + protocol);

      pipelineStatus = "Deployed/Ready"
      // Deploy pipeline
      this.flogoDeployService.deploy(request)
        .subscribe(res => {
          console.log("Received Deployment response: ", res);

        });
    }

    // Save pipeline
    let pipeline = new Pipeline();
    pipeline.created = tsms;
    pipeline.modified = tsms;
    pipeline.name = applicationId;
    pipeline.pipelineType = this.pipelineType;
    pipeline.protocolType = protocol;
    pipeline.dataStoreType = dataStore;
    pipeline.status = pipelineStatus;

    let protocolUid = this.transportForm.get('uid').value;
    let dataStoreUid = this.dataStoreForm.get('uid').value;
    let graphFilterObj = this.buildGraphDataFilteringProperties(this.filteringForm);
    let graphStreamingObj = this.buildGraphStreamingProperties(this.streamingForm);

    // Add pipeline to graph
    this.graphService.addPipeline(this.gateway.uid, pipeline, protocolUid, dataStoreUid, graphFilterObj, graphStreamingObj)
      .subscribe(res => {
        console.log("Added pipeline: ", res);

        this.getGatewayAndPipelines(this.gatewayId)

      });

    this.resetFormsToDefaults();
  }

  /**
   *
   * @param updateGraph - flag indicating if pipeline needs to be removed from graph
   */
  undeploySelectedDataPipeline() {

    if (this.pipelineSelection.hasValue()) {

      this.pipelineSelected = false;
      let tsms = Date.now();
      let pipeline = this.pipelineSelection.selected[0];
      pipeline.modified = tsms;
      pipeline.status = "Undeployed";

      console.log("Undeploying pipeline: " + pipeline.name);

      let urlParams = [];
      urlParams["namespace"] = "default";

      let request = {
        "id": pipeline.name,
        params: {
          "namespace": "default"
        }
      }

      console.log("Undeploy Request: " + JSON.stringify(request));

      // Undeploy pipeline
      this.flogoDeployService.undeploy(request)
        .subscribe(res => {
          console.log("Received response for flogoDeployService.undeploy: ", res);

        });

      // Update graph pipeline
      this.graphService.updatePipeline(pipeline)
        .subscribe(res => {
          console.log("Updated pipeline: ", res);

          this.getGatewayAndPipelines(this.gatewayId)
          this.resetPipelineForm();
          this.resetViewForms();
        });

      // this.undeployDisabled = true;
      // this.deployDisabled = false;

    }
    else {
      console.log("No selection to undeploy");
    }

  }

  /**
   *
   */
  deploySelectedDataPipeline() {

    if (this.pipelineSelection.hasValue()) {

      this.pipelineSelected = false;
      let tsms = Date.now();
      let pipeline = this.pipelineSelection.selected[0]
      pipeline.modified = tsms;
      pipeline.status = "Deployed/Ready";

      console.log("Deploying for protocol: " + pipeline.protocolType);

      let protocolObj = this.buildProtocolProperties(pipeline.protocolType, this.transportViewForm);
      let dataStoreObj = this.buildDataStoreProperties(pipeline.dataStoreType, this.dataStoreViewForm);
      let filterObj = this.buildDataFilteringProperties(this.filteringViewForm);
      let streamingObj = this.buildStreamingProperties(this.streamingForm);
      // let loggingObj = this.buildLoggingProperties();

      let applicationId = pipeline.name;
      let env = [];
      env.push({ "name": "FLOGO_APP_PROPS_ENV", "value": "auto" });
      protocolObj.forEach(function (protocol) {
        env.push(protocol);
      });
      dataStoreObj.forEach(function (datastore) {
        env.push(datastore);
      });
      filterObj.forEach(function (filter) {
        env.push(filter);
      });
      streamingObj.forEach(function (stream) {
        env.push(stream);
      });
      // loggingObj.forEach(function (filter) {
      //   env.push(filter);
      // });

      let request = {
        "id": applicationId,
        "name": "air-" + pipeline.pipelineType + "-" + pipeline.protocolType.toLowerCase() + "-" + pipeline.dataStoreType.toLowerCase(),
        "version": "0.1.0",
        "values": {
          "deployment": {
            "env": env
          }
        }
      }
      console.log("Deploy Request: " + JSON.stringify(request));

      // Deploy Pipeline
      this.flogoDeployService.deploy(request)
        .subscribe(res => {
          console.log("Received response for flogoDeployService.deploy: ", res);

        });


      // Update graph pipeline
      this.graphService.updatePipeline(pipeline)
        .subscribe(res => {
          console.log("Updated pipeline: ", res);

          this.getGatewayAndPipelines(this.gatewayId)
          this.resetPipelineForm();
          this.resetViewForms();
        });
    }
    else {
      console.log("No selection to redeploy");

    }

  }

  /**
   *
   */
  deleteSelectedDataPipeline() {

    console.log("Delete Data Pipeline called");


    if (this.pipelineSelection.hasValue()) {

      this.pipelineSelected = false;

      let pipeline = this.pipelineSelection.selected[0]

      if (pipeline.status != "Undeployed") {
        this.undeploySelectedDataPipeline();
      }
      this.pipelineSelection.clear();

      this.graphService.deletePipeline(this.gateway.uid, pipeline)
        .subscribe(res => {
          console.log("Result from delete pipeline", res);

          this.getGatewayAndPipelines(this.gatewayId);
          this.resetPipelineForm();
          this.resetViewForms();
        });
    }
    else {
      console.log("No selection to delete");

    }

  }

  /**
   * Create forms to add pipelines as well as form to view pipeline information
   */
  createForms() {

    this.pipelineForm = this.formBuilder.group({
      uid: ['', Validators.required],
      name: ['', Validators.required],
      created: ['', Validators.required],
      modified: ['', Validators.required],
      protocolType: ['', Validators.required],
      protocolId: ['', Validators.required],
      dataStoreType: ['', Validators.required],
      dataStoreId: ['', Validators.required],
      status: ['', Validators.required]
    });

    this.transportForm = this.formBuilder.group({
      uid: ['changeme', Validators.required],
      gateway: [this.gatewayId, Validators.required],
      protocolId: ['', Validators.required],
      protocol: ['', Validators.required],
      mqtt: this.formBuilder.group({
        hostname: ['changeme', Validators.required],
        port: ['changeme', Validators.required],
        username: ['changeme', Validators.required],
        password: ['changeme', Validators.required],
        encryptionMode: ['None', Validators.required],
        caCertificate: [''],
        clientCertificate: [''],
        clientKey: [''],
        topic: ['changeme', Validators.required],
        maximumQOS: ['2', Validators.required]
      }),
      kafka: this.formBuilder.group({
        hostname: ['changeme', Validators.required],
        port: ['changeme', Validators.required],
        authMode: ['None', Validators.required],
        username: ['changeme', Validators.required],
        password: ['changeme', Validators.required],
        clientCertificate: [''],
        clientKey: [''],
        serverCertificate: [''],
        connectionTimeout: ['30', Validators.required],
        retryBackoff: ['3', Validators.required],
        topic: ['changeme', Validators.required],
        consumerGroupId: ['changeme', Validators.required],
        commitInterval: ['500', Validators.required],
        initialOffset: ['Oldest', Validators.required],
        fetchMinBytes: ['1', Validators.required],
        fetchMaxWait: ['500', Validators.required],
        heartbeatInterval: ['3000', Validators.required],
        sessionTimeout: ['30000', Validators.required]
      })
    });

    this.dataStoreForm = this.formBuilder.group({
      uid: ['changeme', Validators.required],
      gateway: [this.gatewayId, Validators.required],
      dataStoreId: ['changeme', Validators.required],
      dataStore: ['', Validators.required],
      postgres: this.formBuilder.group({
        host: ['changeme', Validators.required],
        port: ['changeme', Validators.required],
        databaseName: ['changeme', Validators.required],
        user: ['changeme', Validators.required],
        password: ['changeme', Validators.required]
      }),
      snowflake: this.formBuilder.group({
        accountName: ['changeme', Validators.required],
        warehouse: ['changeme', Validators.required],
        database: ['changeme', Validators.required],
        schema: ['changeme', Validators.required],
        authType: ['Basic Authentication', Validators.required],
        username: ['changeme', Validators.required],
        password: ['changeme', Validators.required],
        role: ['changeme', Validators.required],
        clientId: [''],
        clientSecret: [''],
        authorizationCode: [''],
        redirectURI: [''],
        loginTimeout: ['20', Validators.required]
      }),
      dgraph: this.formBuilder.group({
        url: ['changeme', Validators.required],
        username: ['changeme', Validators.required],
        password: ['changeme', Validators.required]
      }),
      tgdb: this.formBuilder.group({
        url: ['changeme', Validators.required],
        username: ['changeme', Validators.required],
        password: ['changeme', Validators.required]
      })
    });

    this.filteringForm = this.formBuilder.group({
      deviceNames: this.formBuilder.array([])
    });

    this.streamingForm = this.formBuilder.group({
      deviceName: ['changeme', Validators.required],
      instrumentName: ['changeme', Validators.required],
      function: ['avg', Validators.required],
      windowType: ['tumbling', Validators.required],
      windowSize: ['5', Validators.required]
    });


    this.transportViewForm = this.formBuilder.group({
      gateway: [this.gatewayId, Validators.required],
      protocolId: ['', Validators.required],
      protocol: ['', Validators.required],
      mqtt: this.formBuilder.group({
        hostname: ['changeme', Validators.required],
        port: ['changeme', Validators.required],
        username: ['changeme', Validators.required],
        password: ['changeme', Validators.required],
        encryptionMode: ['None', Validators.required],
        caCertificate: [''],
        clientCertificate: [''],
        clientKey: [''],
        topic: ['changeme', Validators.required],
        maximumQOS: ['2', Validators.required]
      }),
      kafka: this.formBuilder.group({
        hostname: ['changeme', Validators.required],
        port: ['changeme', Validators.required],
        authMode: ['None', Validators.required],
        username: ['changeme', Validators.required],
        password: ['changeme', Validators.required],
        clientCertificate: [''],
        clientKey: [''],
        serverCertificate: [''],
        connectionTimeout: ['30', Validators.required],
        retryBackoff: ['3', Validators.required],
        topic: ['changeme', Validators.required],
        consumerGroupId: ['changeme', Validators.required],
        commitInterval: ['500', Validators.required],
        initialOffset: ['Oldest', Validators.required],
        fetchMinBytes: ['1', Validators.required],
        fetchMaxWait: ['500', Validators.required],
        heartbeatInterval: ['3000', Validators.required],
        sessionTimeout: ['30000', Validators.required]
      })
    });

    this.dataStoreViewForm = this.formBuilder.group({
      dataStoreId: ['changeme', Validators.required],
      dataStore: ['', Validators.required],
      postgres: this.formBuilder.group({
        host: ['changeme', Validators.required],
        port: ['changeme', Validators.required],
        databaseName: ['changeme', Validators.required],
        user: ['changeme', Validators.required],
        password: ['changeme', Validators.required]
      }),
      snowflake: this.formBuilder.group({
        accountName: ['changeme', Validators.required],
        warehouse: ['changeme', Validators.required],
        database: ['changeme', Validators.required],
        schema: ['changeme', Validators.required],
        authType: ['Basic Authentication', Validators.required],
        username: ['changeme', Validators.required],
        password: ['changeme', Validators.required],
        role: ['changeme', Validators.required],
        clientId: [''],
        clientSecret: [''],
        authorizationCode: [''],
        redirectURI: [''],
        loginTimeout: ['20', Validators.required]
      }),
      dgraph: this.formBuilder.group({
        url: ['changeme', Validators.required],
        username: ['changeme', Validators.required],
        password: ['changeme', Validators.required]
      }),
      tgdb: this.formBuilder.group({
        url: ['changeme', Validators.required],
        username: ['changeme', Validators.required],
        password: ['changeme', Validators.required]
      })
    });

    this.filteringViewForm = this.formBuilder.group({
      deviceNames: this.formBuilder.array([])
    });

    this.streamingViewForm = this.formBuilder.group({
      deviceName: ['changeme', Validators.required],
      instrumentName: ['changeme', Validators.required],
      function: ['avg', Validators.required],
      windowType: ['tumbling', Validators.required],
      windowSize: ['5', Validators.required]
    });

  }

  /**
   *
   */
  resetFormsToDefaults() {

    console.log("Resetting forms to defaults");
    this.pipelineType = "data";

    this.transportForm.patchValue({
      gateway: this.gateway,
      protocolId: '',
      protocol: '',
      mqtt: {
        hostname: '',
        port: '',
        username: '',
        password: '',
        encryptionMode: 'None',
        caCertificate: '',
        clientCertificate: '',
        clientKey: '',
        topic: '',
        maximumQOS: '2'
      },
      kafka: {
        hostname: '',
        port: '',
        authMode: 'None',
        username: '',
        password: '',
        clientCertificate: '',
        clientKey: '',
        serverCertificate: '',
        connectionTimeout: '30',
        retryBackoff: '3',
        topic: '',
        consumerGroupId: '',
        commitInterval: '500',
        initialOffset: 'Oldest',
        fetchMinBytes: '1',
        fetchMaxWait: '500',
        heartbeatInterval: '3000',
        sessionTimeout: '30000',
      }
    },
      { emitEvent: true }
    );

    this.dataStoreForm.patchValue({
      dataStoreId: 'changeme',
      dataStore: '',
      postgres: {
        host: '',
        port: '',
        databaseName: '',
        user: '',
        password: ''
      },
      snowflake: {
        accountName: '',
        warehouse: '',
        database: '',
        schema: '',
        authType: 'Basic Authentication',
        username: '',
        password: '',
        role: '',
        clientId: '',
        clientSecret: '',
        authorizationCode: '',
        redirectURI: '',
        loginTimeout: '20'
      },
      tgdb: {
        url: '',
        username: '',
        password: ''
      },
      dgraph: {
        url: '',
        username: '',
        password: ''
      }
    });

    this.resetFilteringForm();

    this.streamingForm.patchValue({
      deviceName: '',
      instrumentName: '',
      function: 'avg',
      windowType: 'tumbling',
      windowSize: '5'
    });



    Object.keys(this.transportForm.controls).forEach(key => {

      this.transportForm.get(key).setErrors(null);
    });

    this.transportForm.get('mqtt.hostname').setErrors(null);
    this.transportForm.get('mqtt.port').setErrors(null);
    this.transportForm.get('mqtt.topic').setErrors(null);
    this.transportForm.get('mqtt.username').setErrors(null);
    this.transportForm.get('mqtt.password').setErrors(null);

    this.transportForm.get('kafka.hostname').setErrors(null);
    this.transportForm.get('kafka.port').setErrors(null);
    this.transportForm.get('kafka.topic').setErrors(null);
    this.transportForm.get('kafka.consumerGroupId').setErrors(null);
    this.transportForm.get('kafka.username').setErrors(null);
    this.transportForm.get('kafka.password').setErrors(null);

    Object.keys(this.dataStoreForm.controls).forEach(key => {

      this.dataStoreForm.get(key).setErrors(null);
    });

    this.dataStoreForm.get('postgres.host').setErrors(null);
    this.dataStoreForm.get('postgres.port').setErrors(null);
    this.dataStoreForm.get('postgres.databaseName').setErrors(null);
    this.dataStoreForm.get('postgres.user').setErrors(null);
    this.dataStoreForm.get('postgres.password').setErrors(null);

    this.dataStoreForm.get('snowflake.accountName').setErrors(null);
    this.dataStoreForm.get('snowflake.warehouse').setErrors(null);
    this.dataStoreForm.get('snowflake.database').setErrors(null);
    this.dataStoreForm.get('snowflake.schema').setErrors(null);
    this.dataStoreForm.get('snowflake.username').setErrors(null);
    this.dataStoreForm.get('snowflake.password').setErrors(null);
    this.dataStoreForm.get('snowflake.role').setErrors(null);
    this.dataStoreForm.get('snowflake.clientId').setErrors(null);
    this.dataStoreForm.get('snowflake.clientSecret').setErrors(null);
    this.dataStoreForm.get('snowflake.authorizationCode').setErrors(null);
    this.dataStoreForm.get('snowflake.redirectURI').setErrors(null);

    this.dataStoreForm.get('tgdb.url').setErrors(null);
    this.dataStoreForm.get('tgdb.username').setErrors(null);
    this.dataStoreForm.get('tgdb.password').setErrors(null);

    this.dataStoreForm.get('dgraph.url').setErrors(null);
    this.dataStoreForm.get('dgraph.username').setErrors(null);
    this.dataStoreForm.get('dgraph.password').setErrors(null);

    this.stepper.selectedIndex = 0;
  }

  /**
   *
   */
  resetFilteringForm() {

    let i: number = 0;

    this.filteringForm.setControl('deviceNames', this.formBuilder.array([]));

    const devicesArray: FormArray = this.filteringForm.get('deviceNames') as FormArray;

    this.devices.forEach((device, i) => {
      const control = new FormControl(false);
      devicesArray.push(control);
    });
  }

  /**
   *
   */
  resetViewForms() {
    this.transportViewForm.reset({
    }, { emitEvent: true });

    this.dataStoreViewForm.reset({
    }, { emitEvent: true });
  }

  /**
   *
   * @param protocol
   * @param form
   */
  buildProtocolProperties(protocol, form: FormGroup): any {

    let protocolObj = null;

    if (protocol == "MQTT") {

      protocolObj = [
        { "name": "MQTTTrigger.Topic", "value": form.get('mqtt.topic').value },
        { "name": "MQTTTrigger.MaximumQOS", "value": form.get('mqtt.maximumQOS').value },
        { "name": "Mqtt.IoTMQTT.Broker_URL", "value": "tcp://" + form.get('mqtt.hostname').value + ":" + form.get('mqtt.port').value },
        { "name": "Mqtt.IoTMQTT.Username", "value": form.get('mqtt.username').value },
        { "name": "Mqtt.IoTMQTT.Password", "value": form.get('mqtt.password').value },
        { "name": "Mqtt.encryptionMode", "value": form.get('mqtt.encryptionMode').value },
        { "name": "Mqtt.caCertificate", "value": form.get('mqtt.caCertificate').value },
        { "name": "Mqtt.clientCertificate", "value": form.get('mqtt.clientCertificate').value },
        { "name": "Mqtt.clientKey", "value": form.get('mqtt.clientKey').value }
      ];
    }
    else if (protocol == "Kafka") {

      protocolObj = [
        { "name": "Kafka.IoTKafka.Brokers", "value": form.get('kafka.hostname').value + ":" + form.get('kafka.port').value },
        { "name": "Kafka.IoTKafka.Connection_Timeout", "value": form.get('kafka.connectionTimeout').value },
        { "name": "Kafka.IoTKafka.Retry_Backoff", "value": form.get('kafka.retryBackoff').value },
        { "name": "Kafka.IoTKafka.AuthMode", "value": form.get('kafka.authMode').value },
        { "name": "Kafka.IoTKafka.Username", "value": form.get('kafka.username').value },
        { "name": "Kafka.IoTKafka.Password", "value": form.get('kafka.password').value },
        { "name": "Kafka.IoTKafka.ClientCertificate", "value": form.get('kafka.clientCertificate').value },
        { "name": "Kafka.IoTKafka.ClientKey", "value": form.get('kafka.clientKey').value },
        { "name": "Kafka.IoTKafka.ServerCertificate", "value": form.get('kafka.serverCertificate').value },
        { "name": "KafkaTrigger.ConsumerGroupId", "value": form.get('kafka.consumerGroupId').value },
        { "name": "KafkaTrigger.Topic", "value": form.get('kafka.topic').value },
        { "name": "KafkaTrigger.SessionTimeout", "value": form.get('kafka.sessionTimeout').value },
        { "name": "KafkaTrigger.CommitInterval", "value": form.get('kafka.commitInterval').value },
        { "name": "KafkaTrigger.InitialOffset", "value": form.get('kafka.initialOffset').value },
        { "name": "KafkaTrigger.FetchMinBytes", "value": form.get('kafka.fetchMinBytes').value },
        { "name": "KafkaTrigger.FetchMaxWait", "value": form.get('kafka.fetchMaxWait').value },
        { "name": "KafkaTrigger.HeartbeatInterval", "value": form.get('kafka.heartbeatInterval').value }
      ];
    }

    return protocolObj;

  }

  /**
   *
   * @param dataStore
   * @param form
   */
  buildDataStoreProperties(dataStore, form: FormGroup): any {

    let dataStoreObj = null;

    if (dataStore == "Postgres") {

      dataStoreObj = [
        { "name": "PostgreSQL.IoTPostgres.Host", "value": form.get('postgres.host').value },
        { "name": "PostgreSQL.IoTPostgres.Port", "value": form.get('postgres.port').value },
        { "name": "PostgreSQL.IoTPostgres.Database_Name", "value": form.get('postgres.databaseName').value },
        { "name": "PostgreSQL.IoTPostgres.User", "value": form.get('postgres.user').value },
        { "name": "PostgreSQL.IoTPostgres.Password", "value": form.get('postgres.password').value }
      ];
    }
    else if (dataStore == "Snowflake") {

      dataStoreObj = [
        { "name": "", "value": form.get('snowflake.accountName').value },
        { "name": "", "value": form.get('snowflake.accountName').value },
        { "name": "", "value": form.get('snowflake.database').value },
        { "name": "", "value": form.get('snowflake.schema').value },
        { "name": "", "value": form.get('snowflake.authType').value },
        { "name": "", "value": form.get('snowflake.username').value },
        { "name": "", "value": form.get('snowflake.password').value },
        { "name": "", "value": form.get('snowflake.clientId').value },
        { "name": "", "value": form.get('snowflake.clientSecret').value },
        { "name": "", "value": form.get('snowflake.authorizationCode').value },
        { "name": "", "value": form.get('snowflake.redirectURI').value },
        { "name": "", "value": form.get('snowflake.loginTimeout').value }
      ];
    }
    else if (dataStore == "TGDB") {

      dataStoreObj = [
        { "name": "GraphBuilder_TGDB.IoTTGDB.TGDB_Server_URL", "value": form.get('tgdb.url').value },
        { "name": "GraphBuilder_TGDB.IoTTGDB.Username", "value": form.get('tgdb.username').value },
        { "name": "GraphBuilder_TGDB.IoTTGDB.Password", "value": form.get('tgdb.password').value }
      ];
    }
    else if (dataStore = "Dgraph") {

      dataStoreObj = [
        { "name": "GraphBuilder_dgraph.IoTDgraph.Dgraph_Server_URL", "value": form.get('dgraph.url').value },
        { "name": "GraphBuilder_dgraph.IoTDgraph.Username", "value": form.get('dgraph.username').value },
        { "name": "GraphBuilder_dgraph.IoTDgraph.Password", "value": form.get('dgraph.password').value }
      ];

    };

    return dataStoreObj;
  }

  /**
   *
   * @param form
   */
  buildDataFilteringProperties(form: FormGroup): any {

    const devicesArray: FormArray = form.get('deviceNames') as FormArray;
    let i: number = 0;
    var filters = [];

    devicesArray.controls.forEach((item: FormControl) => {

      if (item.value) {
        filters.push(this.devices[i].name);
      }
      i++;
    });

    let filterObj = [
      { "name": "Filtering.DeviceNames", "value": filters.toString() }
    ];

    return filterObj;
  }

  /**
 *
 * @param form
 */
  buildGraphDataFilteringProperties(form: FormGroup): any {

    const devicesArray: FormArray = form.get('deviceNames') as FormArray;
    let i: number = 0;
    var filters = [];

    devicesArray.controls.forEach((item: FormControl) => {

      if (item.value) {
        filters.push(this.devices[i].name);
      }
      i++;
    });

    let dataStoreObj = [
      { "name": "deviceNames", "value": filters.toString() }
    ];

    return dataStoreObj;
  }

  /**
   *
   * @param form
   */
  buildGraphStreamingProperties(form: FormGroup): any {

    let streamingObj = [
      { "name": "deviceName", "value": form.get('deviceName').value },
      { "name": "instrumentName", "value": form.get('instrumentName').value },
      { "name": "function", "value": form.get('function').value },
      { "name": "windowType", "value": form.get('windowType').value },
      { "name": "windowSize", "value": form.get('windowSize').value }
    ];

    return streamingObj;
  }

  /**
   *
   * @param form
   */
  buildStreamingProperties(form: FormGroup): any {

    let streamingObj = [
      { "name": "Streaming.DeviceName", "value": form.get('deviceName').value },
      { "name": "Streaming.InstrumentName", "value": form.get('instrumentName').value },
      { "name": "Streaming.Function", "value": form.get('function').value },
      { "name": "Streaming.WindowType", "value": form.get('windowType').value },
      { "name": "Streaming.WindowSize", "value": form.get('windowSize').value }
    ];

    return streamingObj;
  }

  buildLoggingProperties(): any {
    let loggingObj = [
      { "name": "Logging.LogLevel", "value": "INFO" },
    ];

    return loggingObj;
  }

  /**
   * Get Devices to be used for filtering
   * @param gateway
   */
  getDevices(gateway) {
    console.log("Calling EdgeService to get devices for: ", gateway);

    this.edgeService.getDevices(gateway)
      .subscribe(res => {
        this.devices = res as Device[];

        console.log("Got devices: ", this.devices);

        this.initializeFilteringForm();

      })
  }

  /**
   *
   */
  initializeFilteringForm() {

    const devicesArray: FormArray = this.filteringForm.get('deviceNames') as FormArray;

    this.devices.forEach((device, i) => {
      const control = new FormControl(false);
      devicesArray.push(control);
    });

  }

}
