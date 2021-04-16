import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { GraphService } from '../../services/graph/graph.service';
import { EdgeService } from '../../services/edge/edge.service';
import { FlogoDeployService } from '../../services/deployment/flogo-deploy.service';
import { Pipeline, Gateway, Device, Model } from '../../shared/models/iot.model';

import { PipelineFilteringComponent } from "./pipeline-filtering/pipeline-filtering.component"
import { PipelineInferencingComponent } from './pipeline-inferencing/pipeline-inferencing.component';
// Rete editor specific
import { NodeEditor, Engine } from "rete";
import ConnectionPlugin from "rete-connection-plugin";
import { AngularRenderPlugin } from "rete-angular-render-plugin";
import ContextMenuPlugin from "rete-context-menu-plugin";
import { zoomAt } from "rete-area-plugin";

import { DataStoreComponent } from "../rete/components/data-store-component";
import { DataSourceComponent } from "../rete/components/data-source-component";
import { FiltersComponent } from "../rete/components/filters-component";
import { DataPipeComponent } from "../rete/components/data-pipe-component";
import { CustomPipeComponent } from "../rete/components/custom-pipe-component";
import { ErrorHandlerComponent } from "../rete/components/error-handler-component";
import { ImageResizeComponent } from "../rete/components/image-resize-component";
import { InferencingComponent } from "../rete/components/inferencing-component";
import { RulesComponent } from "../rete/components/rules-component";
import { StreamingComponent } from "../rete/components/streaming-component";
import { NotificationPipeComponent } from "../rete/components/notification-pipe-component";
import { NodePrimaryComponent } from "../rete/nodes/node-primary/node-primary.component"
import { pipe } from 'rxjs';
import { DataFilteringComponent } from '../iot-data-pipeline/data-filtering/data-filtering.component';
import { LogLevel } from '@tibco-tcstk/tc-core-lib';
import { stringify } from '@angular/compiler/src/util';



@Component({
  selector: 'app-iot-pipeline',
  templateUrl: './iot-pipeline.component.html',
  styleUrls: ['./iot-pipeline.component.css']
})
export class IotPipelineComponent implements OnInit {

  gatewayId = "";
  gateway = null as Gateway;
  devices: Device[] = [];
  models: Model[] = [];
  pipelineSelected = false;  // Used to control the display of buttons
  deployDisabled = true;
  undeployDisabled = true;

  pipelinesDataSource = new MatTableDataSource<Pipeline>();
  pipelineDisplayedColumns: string[] = ['id', 'name', 'pipelineType', 'status', 'created', 'modified'];
  pipelineSelection = new SelectionModel<Pipeline>(false, []);

  pipelineConfig = true;
  dataSourceConfig = false;
  filteringConfig = false;
  dataStoreConfig = false;
  dataPipeConfig = false;
  inferencingConfig = false;
  rulesConfig = false;
  streamingConfig = false;
  flogoFlowConfig = false;

  lastNodeSelected = null;

  filters: any[] = [];

  pipelineForm: FormGroup;
  protocolForm: FormGroup;
  dataStoreForm: FormGroup;
  streamingForm: FormGroup;
  modelForm: FormGroup;
  ruleForm: FormGroup;
  flogoFlowForm: FormGroup;

  ruleTuplesDescriptor = [
    {
      "name": "ReadingEvent",
      "ttl": 0,
      "properties": [
        {
          "name": "id",
          "type": "string",
          "pk-index": 0
        },
        {
          "name": "gateway",
          "type": "String"
        },
        {
          "name": "device",
          "type": "String"
        },
        {
          "name": "resource",
          "type": "String"
        },
        {
          "name": "value",
          "type": "string"
        }
      ]
    },
    {
      "name": "ResourceConcept",
      "ttl": -1,
      "properties": [
        {
          "name": "id",
          "type": "string",
          "pk-index": 0
        },
        {
          "name": "device",
          "type": "String"
        },
        {
          "name": "resource",
          "type": "String"
        },
        {
          "name": "value",
          "type": "string"
        }
      ]
    }
  ]


  private filterComponent: PipelineFilteringComponent;

  @ViewChild('filterComponent') set fcontent(content: PipelineFilteringComponent) {
    if (content) { // initially setter gets called with undefined
      this.filterComponent = content;
    }
  }

  private inferenceComponent: PipelineInferencingComponent;
  @ViewChild('inferenceComponent') set icontent(content: PipelineInferencingComponent) {
    if (content) { // initially setter gets called with undefined
      this.inferenceComponent = content;
    }
  }

  @ViewChild("nodeEditor") el: ElementRef;
  editor = null;

  constructor(private graphService: GraphService,
    private edgeService: EdgeService,
    private flogoDeployService: FlogoDeployService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private _snackBar: MatSnackBar) {

  }

  ngOnInit(): void {
    // Get gateway id from route
    this.gatewayId = this.route.snapshot.paramMap.get('gatewayId');

    this.getGatewayDetails(this.gatewayId);

    this.createForms();
  }


  async ngAfterViewInit() {

    console.log("PipelineEditor - ngAfterViewInit - devices: ", this.devices);

    const container = this.el.nativeElement;

    // new ImageResizeComponent();

    const components = [
      new DataSourceComponent(),
      new FiltersComponent(),
      new InferencingComponent(),
      new RulesComponent(),
      new StreamingComponent(),
      new ImageResizeComponent(),
      new DataStoreComponent(),
      new DataPipeComponent(),
      new CustomPipeComponent(),
      new NotificationPipeComponent(),
      new FlogoFlowComponent(),
      new ErrorHandlerComponent()
    ];

    this.editor = new NodeEditor("demo@0.2.0", container);

    this.editor.use(ConnectionPlugin);
    console.log("AngularRenderPlugin", AngularRenderPlugin);
    this.editor.use(AngularRenderPlugin, { component: NodePrimaryComponent });
    this.editor.use(ContextMenuPlugin);

    const engine = new Engine("demo@0.2.0");

    components.map(c => {
      this.editor.register(c);
      engine.register(c);
    });

    this.editor.on(
      [
        "process",
        "nodecreated",
        "noderemoved",
        "connectioncreated",
        "connectionremoved"
      ],
      (async () => {
        console.log("Editor action executed");

        // await engine.abort();
        // await engine.process(this.editor.toJSON());
      }) as any
    );

    // this.editor.on(
    //   [
    //     "nodeselected"
    //   ],
    //   (async () => {
    //     console.log("Editor node selected");

    //   }) as any
    // );

    this.editor.on("nodeselected", node => {

      console.log("Editor node selected", node);

      console.log("Node data: ", node.data);

      if (this.lastNodeSelected != null) {
        this.saveNodeContext(this.lastNodeSelected);

        // Clean shared variables
        this.clearFormsAndFilters();
      }

      this.lastNodeSelected = node;

      this.resetNodeContext(node);

    });


    this.editor.on("click", (async () => {

      console.log("Editor selected");

      if (this.lastNodeSelected != null) {

        this.saveNodeContext(this.lastNodeSelected);

        // Clean shared variables
        this.clearFormsAndFilters();

        // Remove visual selection
        // this.editor.selected.remove(this.lastNodeSelected);
        // this.editor.trigger('nodeselected', this.lastNodeSelected);

        this.editor.selected.clear();
        this.editor.nodes.map(n => n.update())

        this.lastNodeSelected = null;

        this.resetNodeContext(null);
      }

    }) as any
    );

    // Disable zooming on double click and wheel
    // this.editor.on('zoom', ({ source }) => { return source !== 'wheel' && source !== 'dblclick'; });
    this.editor.on('zoom', ({ source }) => { return source !== 'dblclick'; });

    this.editor.view.resize();
    // this.editor.view.scale(0.5);
    // this.editor.view.update();

    this.editor.trigger("process");
    // zoomAt(this.editor);

  }

  findDataSourceFlowNode(flow): any {

    let node = null;

    console.log("Flow:  ", flow);

    let keys = Object.keys(flow.nodes);

    for (let i = 0; i < keys.length; i++) {
      console.log("This is key :", keys[i]);
      if (flow.nodes[keys[i]].name == "Data Source") {
        node = flow.nodes[keys[i]];
        break;
      }

    }

    Object.keys(flow.nodes).forEach(key => {
      const outputJson = flow.nodes[key];

      if (flow.nodes[key].name == "Data Source") {

      }
      console.log("Node by key: ", outputJson);

    });



    console.log("First DataSource node: ", node);

    return node;
  }

  saveNodeContext(node) {

    let name = node.name;
    let contextObj = null;

    switch (name) {
      case "Data Source": {

        contextObj = this.buildNodeProtocolProperties(this.protocolForm);
        break;
      }
      case "Data Store": {

        contextObj = this.buildNodeDataStoreProperties(this.dataStoreForm);
        break;
      }
      case "Data Pipe": {

        contextObj = this.buildNodeProtocolProperties(this.protocolForm);
        break;
      }
      case "Custom Pipe": {

        contextObj = this.buildNodeProtocolProperties(this.protocolForm);
        break;
      }
      case "Notification Pipe": {

        contextObj = this.buildNodeProtocolProperties(this.protocolForm);
        break;
      }
      case "Filters": {
        contextObj = this.buildNodeDataFilteringProperties();
        break;
      }
      case "Inferencing": {
        contextObj = this.buildNodeDataInferencingProperties();
        break;
      }
      case "Streaming": {
        contextObj = this.buildNodeDataStreamingProperties();
        break;
      }
      case "Rules": {
        contextObj = this.buildNodeRuleProperties();
        break;
      }
      case "Flogo Flow": {
        contextObj = this.buildNodeFlogoFlowProperties();
        break;
      }
      default: {

        break;
      }
    }

    node.data["customdata"] = contextObj;

  }

  resetNodeContext(node) {

    this.pipelineConfig = false;
    this.dataSourceConfig = false;
    this.filteringConfig = false;
    this.dataStoreConfig = false;
    this.dataPipeConfig = false;
    this.inferencingConfig = false;
    this.rulesConfig = false;
    this.streamingConfig = false;
    this.flogoFlowConfig = false;

    if (node != null || node != undefined) {
      console.log("Resetting context for node: ", node);
      console.log("Resetting context for node name: ", node.name);

      let contextObj = node.data['customdata'];

      switch (node.name) {
        case "Data Source": {
          this.updateProtocolForm(contextObj);
          this.dataSourceConfig = true;
          break;
        }
        case "Data Store": {
          this.updateDataStoreForm(contextObj)
          this.dataStoreConfig = true;
          break;
        }
        case "Data Pipe": {
          this.updateProtocolForm(contextObj);
          this.dataPipeConfig = true;
          break;
        }
        case "Custom Pipe": {
          this.updateProtocolForm(contextObj);
          this.dataPipeConfig = true;
          break;
        }
        case "Notification Pipe": {
          this.updateProtocolForm(contextObj);
          this.dataPipeConfig = true;
          break;
        }
        case "Filters": {
          this.filteringConfig = true;
          this.updateFiltersComponent(contextObj);
          break;
        }
        case "Inferencing": {
          this.updateInferencingComponent(contextObj);
          this.inferencingConfig = true;
          break;
        }
        case "Streaming": {
          this.updateStreamingComponent(contextObj);
          this.streamingConfig = true;
          break;
        }
        case "Rules": {
          this.updateRulesComponent(contextObj);
          this.rulesConfig = true;
          break;
        }
        case "Flogo Flow": {
          this.updateFlogoFlowComponent(contextObj);
          this.flogoFlowConfig = true;
          break;
        }
        default: {
          this.pipelineConfig = true;
          break;
        }
      }

    }
    else {
      this.pipelineConfig = true;
    }

  }

  clearFormsAndFilters() {

    this.filters = [];

    this.modelForm.reset({
      name: '',
      description: '',
      inputType: '',
      url: '',
      platform: '',
      logLevel: 'INFO',
    }, { emitEvent: false });

    this.protocolForm.patchValue({
      protocolId: '',
      protocol: '',
      logLevel: 'INFO',
    }, { emitEvent: true });

  }


  /**
   * Create forms to add pipelines as well as form to view pipeline information
   */
  createForms() {

    this.pipelineForm = this.formBuilder.group({
      uid: ['', Validators.required],
      name: ['', Validators.required],
      pipelineType: ['', Validators.required],
      description: ['', Validators.required],
      created: ['', Validators.required],
      modified: ['', Validators.required],
      status: ['', Validators.required],
      flowConfiguration: ['', Validators.required],
      logLevel: ['INFO', Validators.required]
    });

    this.protocolForm = this.formBuilder.group({
      uid: ['changeme', Validators.required],
      gateway: [this.gatewayId, Validators.required],
      protocolId: ['', Validators.required],
      protocol: ['', Validators.required],
      logLevel: ['INFO', Validators.required],
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
      }),
      amqp: this.formBuilder.group({
        hostname: ['changeme', Validators.required],
        port: ['changeme', Validators.required],
        username: ['changeme', Validators.required],
        password: ['changeme', Validators.required],
        exchangeName: ['changeme', Validators.required],
        exchangeType: ['topic', Validators.required],
        routingKey: ['air', Validators.required],
        reliable: ['true', Validators.required],
      })
    });

    this.dataStoreForm = this.formBuilder.group({
      uid: ['changeme', Validators.required],
      gateway: [this.gatewayId, Validators.required],
      dataStoreId: ['', Validators.required],
      dataStore: ['', Validators.required],
      logLevel: ['INFO', Validators.required],
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

    this.streamingForm = this.formBuilder.group({
      deviceName: ['changeme', Validators.required],
      instrumentName: ['changeme', Validators.required],
      function: ['avg', Validators.required],
      windowType: ['tumbling', Validators.required],
      windowSize: ['5', Validators.required],
      logLevel: ['INFO', Validators.required]
    });

    this.modelForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      inputType: ['', Validators.required],
      url: ['', Validators.required],
      platform: ['', Validators.required],
      logLevel: ['INFO', Validators.required]
    });

    this.ruleForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: [''],
      condDevice: ['', Validators.required],
      condResource: ['', Validators.required],
      condCompareNewMetricToValue: [true],
      condCompareNewMetricToValueOp: ['', Validators.required],
      condCompareNewMetricValue: ['', Validators.required],
      condCompareNewMetricToLastMetric: [false],
      condCompareNewMetricToLastMetricOp: [''],
      condCompareLastMetricToValue: [false],
      condCompareLastMetricToValueOp: [''],
      condCompareLastMetricValue: [''],
      actionSendNotification: [true],
      actionNotification: ['', Validators.required],
      actionSendCommand: [true],
      actionDevice: ['', Validators.required],
      actionResource: ['', Validators.required],
      actionValue: ['', Validators.required],
      logLevel: ['INFO', Validators.required]
    });

    this.flogoFlowForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: [''],
      flowDefinition: ['', Validators.required],
      flowProperties: ['', Validators.required]
    });

  }

  /**
   *
   * @param form
   */
  buildNodeProtocolProperties(form: FormGroup): any {
    let protocol = form.get('protocol').value;

    let protocolObj = null;

    if (protocol == "MQTT") {

      protocolObj = {
        "protocol": form.get('protocol').value,
        "protocolId": form.get('protocolId').value,
        "logLevel": form.get('logLevel').value,
        "hostname": form.get('mqtt.hostname').value,
        "port": form.get('mqtt.port').value,
        "username": form.get('mqtt.username').value,
        "password": form.get('mqtt.password').value,
        "encriptionMode": form.get('mqtt.encryptionMode').value,
        "caCertificate": form.get('mqtt.caCertificate').value,
        "clientCertificate": form.get('mqtt.clientCertificate').value,
        "clientKey": form.get('mqtt.clientKey').value,
        "topic": form.get('mqtt.topic').value,
        "maximumQOS": form.get('mqtt.maximumQOS').value,
      }

    }
    else if (protocol == "Kafka") {

      protocolObj = {
        "protocol": form.get('protocol').value,
        "protocolId": form.get('protocolId').value,
        "logLevel": form.get('logLevel').value,
        "hostname": form.get('kafka.hostname').value,
        "port": form.get('kafka.port').value,
        "authMode": form.get('kafka.authMode').value,
        "username": form.get('kafka.username').value,
        "password": form.get('kafka.password').value,
        "clientCertificate": form.get('kafka.clientCertificate').value,
        "clientKey": form.get('kafka.clientKey').value,
        "serverCertificate": form.get('kafka.serverCertificate').value,
        "connectionTimeout": form.get('kafka.connectionTimeout').value,
        "retryBackoff": form.get('kafka.retryBackoff').value,
        "topic": form.get('kafka.topic').value,
        "consumerGroupId": form.get('kafka.consumerGroupId').value,
        "commitInterval": form.get('kafka.commitInterval').value,
        "initialOffset": form.get('kafka.initialOffset').value,
        "fetchMinBytes": form.get('kafka.fetchMinBytes').value,
        "fetchMaxWait": form.get('kafka.fetchMaxWait').value,
        "heartbeatInterval": form.get('kafka.heartbeatInterval').value,
        "sessionTimeout": form.get('kafka.sessionTimeout').value,
      }

    }
    else if (protocol == "AMQP") {

      protocolObj = {
        "protocol": form.get('protocol').value,
        "protocolId": form.get('protocolId').value,
        "logLevel": form.get('logLevel').value,
        "hostname": form.get('amqp.hostname').value,
        "port": form.get('amqp.port').value,
        "username": form.get('amqp.username').value,
        "password": form.get('amqp.password').value,
        "exchangeName": form.get('amqp.exchangeName').value,
        "exchangeType": form.get('amqp.exchangeType').value,
        "routingKey": form.get('amqp.routingKey').value,
        "reliable": form.get('amqp.reliable').value
      }

    }


    return protocolObj;

  }

  /**
   *
   * @param form
   */
  buildNodeDataStoreProperties(form: FormGroup): any {
    let dataStore = form.get('dataStore').value;

    let dataStoreObj = null;

    if (dataStore == "PostgreSQL") {

      dataStoreObj = {
        "dataStore": form.get('dataStore').value,
        "dataStoreId": form.get('dataStoreId').value,
        "logLevel": form.get('logLevel').value,
        "host": form.get('postgres.host').value,
        "port": form.get('postgres.port').value,
        "databaseName": form.get('postgres.databaseName').value,
        "user": form.get('postgres.user').value,
        "password": form.get('postgres.password').value,
      }
    }
    else if (dataStore == "Snowflake") {

      dataStoreObj = {
        "dataStore": form.get('dataStore').value,
        "dataStoreId": form.get('dataStoreId').value,
        "logLevel": form.get('logLevel').value,
        "accountName": form.get('snowflake.accountName').value,
        "warehouse": form.get('snowflake.warehouse').value,
        "database": form.get('snowflake.database').value,
        "schema": form.get('snowflake.schema').value,
        "authType": form.get('snowflake.authType').value,
        "username": form.get('snowflake.username').value,
        "password": form.get('snowflake.password').value,
        "role": form.get('snowflake.role').value,
        "clientId": form.get('snowflake.clientId').value,
        "clientSecret": form.get('snowflake.clientSecret').value,
        "authorizationCode": form.get('snowflake.authorizationCode').value,
        "redirectURI": form.get('snowflake.redirectURI').value,
        "loginTimeout": form.get('snowflake.loginTimeout').value,
      }
    }
    else if (dataStore == "TGDB") {

      dataStoreObj = {
        "dataStore": form.get('dataStore').value,
        "dataStoreId": form.get('dataStoreId').value,
        "logLevel": form.get('logLevel').value,
        "url": form.get('tgdb.url').value,
        "username": form.get('tgdb.username').value,
        "password": form.get('tgdb.password').value,
      }
    }
    else if (dataStore = "Dgraph") {

      dataStoreObj = {
        "dataStore": form.get('dataStore').value,
        "dataStoreId": form.get('dataStoreId').value,
        "logLevel": form.get('logLevel').value,
        "url": form.get('dgraph.url').value,
        "username": form.get('dgraph.username').value,
        "password": form.get('dgraph.password').value,
      }

    };

    return dataStoreObj;
  }

  /**
   *
   * @param form
   */
  buildNodeDataFilteringProperties(): any {

    let filterObj = {
      "filters": this.filterComponent.getFilters()
    };

    console.log("iot-pipeline_buildNodeDataFilteringProperties: filters:", filterObj);


    return filterObj;
  }

  /**
   *
   * @param form
   */
  buildNodeDataInferencingProperties(): any {

    let inferenceObj = {
      "modelName": this.modelForm.get('name').value,
      "modelDescription": this.modelForm.get('description').value,
      "modelUrl": this.modelForm.get('url').value,
      "modelPlatform": this.modelForm.get('platform').value,
      "filters": this.inferenceComponent.getFilters(),
      "logLevel": this.modelForm.get('logLevel').value,
    };

    return inferenceObj;
  }

  /**
   *
   * @param form
   */
  buildNodeDataStreamingProperties(): any {

    let streamingObj = {
      "deviceName": this.streamingForm.get('deviceName').value,
      "instrumentName": this.streamingForm.get('instrumentName').value,
      "function": this.streamingForm.get('function').value,
      "windowType": this.streamingForm.get('windowType').value,
      "windowSize": this.streamingForm.get('windowSize').value,
      "logLevel": this.streamingForm.get('logLevel').value
    };

    return streamingObj;
  }

  /**
   *
   * @param form
   */
  buildNodeRuleProperties(): any {

    let ruleObj = {
      "name": this.ruleForm.get('name').value,
      "description": this.ruleForm.get('description').value,
      "condDevice": this.ruleForm.get('condDevice').value,
      "condResource": this.ruleForm.get('condResource').value,
      "condCompareNewMetricToValue": this.ruleForm.get('condCompareNewMetricToValue').value,
      "condCompareNewMetricToValueOp": this.ruleForm.get('condCompareNewMetricToValueOp').value,
      "condCompareNewMetricValue": this.ruleForm.get('condCompareNewMetricValue').value,
      "condCompareNewMetricToLastMetric": this.ruleForm.get('condCompareNewMetricToLastMetric').value,
      "condCompareNewMetricToLastMetricOp": this.ruleForm.get('condCompareNewMetricToLastMetricOp').value,
      "condCompareLastMetricToValue": this.ruleForm.get('condCompareLastMetricToValue').value,
      "condCompareLastMetricToValueOp": this.ruleForm.get('condCompareLastMetricToValueOp').value,
      "condCompareLastMetricValue": this.ruleForm.get('condCompareLastMetricValue').value,
      "actionSendNotification": this.ruleForm.get('actionSendNotification').value,
      "actionNotification": this.ruleForm.get('actionNotification').value,
      "actionSendCommand": this.ruleForm.get('actionSendCommand').value,
      "actionDevice": this.ruleForm.get('actionDevice').value,
      "actionResource": this.ruleForm.get('actionResource').value,
      "actionValue": this.ruleForm.get('actionValue').value,
      "logLevel": this.ruleForm.get('logLevel').value
    };

    console.log("Rule context saved: ", ruleObj);

    return ruleObj;
  }

  /**
   *
   * @param form
   */
  buildNodeFlogoFlowProperties(): any {

    let flogoFlowObj = {
      "name": this.flogoFlowForm.get('name').value,
      "description": this.flogoFlowForm.get('description').value,
      "flowDefinition": this.flogoFlowForm.get('flowDefinition').value,
      "flowProperties": this.flogoFlowForm.get('flowProperties').value
    };

    console.log("FlogoFlow context saved: ", flogoFlowObj);

    return flogoFlowObj;
  }


  /**
   *
   * @param context
   */
  updateProtocolForm(context) {

    if (context != null || context != undefined) {
      console.log("Updating protocolform with context: ", context);

      let protocolId = context.protocolId;
      let protocol = context.protocol;

      // Update protocol form
      console.log("Setting transportviewform protocol to: ", protocol);

      if (protocol == "MQTT") {

        this.protocolForm.patchValue({
          protocol: protocol,
          protocolId: protocolId,
          logLevel: context.logLevel,
          mqtt: {
            hostname: context.hostname,
            port: context.port,
            username: context.username,
            password: context.password,
            encryptionMode: context.encryptionMode,
            caCertificate: context.caCertificate,
            clientCertificate: context.clientCertificate,
            clientKey: context.clientKey,
            topic: context.topic,
            maximumQOS: context.maximumQOS
          }
        });

      }
      else if (protocol == "Kafka") {

        this.protocolForm.patchValue({
          protocol: protocol,
          protocolId: protocolId,
          logLevel: context.logLevel,
          kafka: {
            hostname: context.hostname,
            port: context.port,
            authMode: context.authMode,
            username: context.username,
            password: context.password,
            clientCertificate: context.clientCertificate,
            clientKey: context.clientKey,
            serverCertificate: context.serverCertificate,
            connectionTimeout: context.connectionTimeout,
            retryBackoff: context.retryBackoff,
            topic: context.topic,
            consumerGroupId: context.consumerGroupId,
            commitInterval: context.commitInterval,
            initialOffset: context.initialOffset,
            fetchMinBytes: context.fetchMinBytes,
            fetchMaxWait: context.fetchMaxWait,
            heartbeatInterval: context.heartbeatInterval,
            sessionTimeout: context.sessionTimeout
          }
        });
      }
      else if (protocol == "AMQP") {

        this.protocolForm.patchValue({
          protocol: protocol,
          protocolId: protocolId,
          logLevel: context.logLevel,
          amqp: {
            hostname: context.hostname,
            port: context.port,
            username: context.username,
            password: context.password,
            exchangeName: context.exchangeName,
            exchangeType: context.exchangeType,
            routingKey: context.routingKey,
            reliable: context.reliable
          }
        });
      }

    }
  }


  /**
   *
   * @param context
   */
  updateDataStoreForm(context) {

    if (context != null || context != undefined) {
      console.log("Updating protocolform with context: ", context);

      let dataStoreId = context.dataStoreId;
      let dataStore = context.dataStore;

      // Update datastore form
      console.log("Setting datastore form datastore to: ", dataStore);

      if (dataStore == "PostgreSQL") {

        this.dataStoreForm.patchValue({
          dataStoreId: dataStoreId,
          dataStore: dataStore,
          logLevel: context.logLevel,
          postgres: {
            host: context.host,
            port: context.port,
            databaseName: context.databaseName,
            user: context.user,
            password: context.password
          }
        });

      }
      else if (dataStore == "Snowflake") {

        this.dataStoreForm.patchValue({
          dataStoreId: dataStoreId,
          dataStore: dataStore,
          logLevel: context.logLevel,
          snowflake: {
            accountName: context.accountName,
            warehouse: context.warehouse,
            database: context.database,
            schema: context.schema,
            authType: context.authType,
            username: context.username,
            password: context.password,
            role: context.role,
            clientId: context.clientId,
            clientSecret: context.clientSecret,
            authorizationCode: context.authorizationCode,
            redirectURI: context.redirectURI,
            loginTimeout: context.loginTimeout
          }
        });
      }
      else if (dataStore == "TGDB") {

        this.dataStoreForm.patchValue({
          dataStoreId: dataStoreId,
          dataStore: dataStore,
          logLevel: context.logLevel,
          tgdb: {
            url: context.url,
            username: context.username,
            password: context.password
          }
        })
      }
      else if (dataStore == "Dgraph") {

        this.dataStoreForm.patchValue({
          dataStoreId: dataStoreId,
          dataStore: dataStore,
          logLevel: context.logLevel,
          dgraph: {
            url: context.url,
            username: context.username,
            password: context.password
          }
        })
      }

    }
  }

  /**
   *
   * @param context
   */
  updateFiltersComponent(context) {

    if (context != null || context != undefined) {
      console.log("Updating filter component with context: ", context);

      this.filters = context.filters;
    }
  }

  /**
   *
   * @param context
   */
  updateInferencingComponent(context) {

    if (context != null || context != undefined) {
      console.log("Updating inferencing component with context: ", context);

      this.filters = context.filters;

      this.modelForm.patchValue({
        name: context.modelName,
        description: context.modelDescription,
        url: context.modelUrl,
        platform: context.modelPlatform,
        LogLevel: context.logLevel
      })

    }
  }

  /**
   *
   * @param context
   */
  updateStreamingComponent(context) {

    if (context != null || context != undefined) {
      console.log("Updating streaming component with context: ", context);

      this.streamingForm.patchValue({
        deviceName: context.deviceName,
        instrumentName: context.instrumentName,
        function: context.function,
        windowType: context.windowType,
        windowSize: context.windowSize,
        logLevel: context.logLevel,
      })

    }
  }

  /**
   *
   * @param context
   */
  updateRulesComponent(context) {

    if (context != null || context != undefined) {
      console.log("Updating rules component with context: ", context);

      this.ruleForm.patchValue({
        name: context.name,
        description: context.description,
        condDevice: context.condDevice,
        condResource: context.condResource,
        condCompareNewMetricToValue: context.condCompareNewMetricToValue,
        condCompareNewMetricToValueOp: context.condCompareNewMetricToValueOp,
        condCompareNewMetricValue: context.condCompareNewMetricValue,
        condCompareNewMetricToLastMetric: context.condCompareNewMetricToLastMetric,
        condCompareNewMetricToLastMetricOp: context.condCompareNewMetricToLastMetricOp,
        condCompareLastMetricToValue: context.condCompareLastMetricToValue,
        condCompareLastMetricToValueOp: context.condCompareLastMetricToValueOp,
        condCompareLastMetricValue: context.condCompareLastMetricValue,
        actionSendNotification: context.actionSendNotification,
        actionNotification: context.actionNotification,
        actionSendCommand: context.actionSendCommand,
        actionDevice: context.actionDevice,
        actionResource: context.actionResource,
        actionValue: context.actionValue,
        logLevel: context.logLevel,
      })

    }
  }

  /**
 *
 * @param context
 */
  updateFlogoFlowComponent(context) {

    if (context != null || context != undefined) {
      console.log("Updating flogo flow component with context: ", context);

      this.flogoFlowForm.patchValue({
        name: context.name,
        description: context.description,
        flowDefinition: context.flowDefinition,
        flowProperties: context.flowProperties,
      })

    }
  }

  /**
   * Get Gateway, Pipelines and Devices information
   */
  public getGatewayAndPipelines(gatewayId: string, selectedPipeline: Pipeline) {
    console.log("Getting gateway and pipelines for: ", gatewayId);

    this.graphService.getGatewayAndPipelines(gatewayId)
      .subscribe(res => {
        console.log("Received response for graphService.getGatewayAndPipelines: ", res);
        this.gateway = res[0] as Gateway;

        if (res[0].pipelines != undefined) {

          console.log("Setting pipelineDataSource.data fo incoming pipeline");


          this.pipelinesDataSource.data = res[0].pipelines as Pipeline[];

          // Select last selectedPipeline
          if (selectedPipeline != null) {
            for (let i = 0; i < this.pipelinesDataSource.data.length; i++) {
              if (this.pipelinesDataSource.data[i].name == selectedPipeline.name) {
                this.onPipelineClicked(this.pipelinesDataSource.data[i]);
              }
            }
          }

        }
        else {

          this.pipelinesDataSource = new MatTableDataSource<Pipeline>();

          console.log("Setting pipelineDataSource.data to null");
        }

      })
  }

  /**
   * Get Gateway, Pipelines and Devices information
   */
  public getGatewayDetails(gatewayId: string) {
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

        // Get Models to be used for inferencing
        this.getModels(gatewayId);

      })
  }

  /**
   * Get Devices for a geteway
   * @param gateway
   */
  getDevices(gateway) {
    console.log("Calling EdgeService to get devices for: ", gateway);

    this.edgeService.getDevices(gateway)
      .subscribe(res => {
        this.devices = res as Device[];

        console.log("Got devices: ", this.devices);

      })
  }

  /**
   * Get Models for a geteway
   * @param gateway
   */
  getModels(gatewayId) {
    console.log("Calling GraphService to get models for: ", gatewayId);

    this.graphService.getModels(gatewayId)
      .subscribe(res => {
        this.models = res as Model[];

        console.log("Got models: ", this.models);

      })
  }

  /**
   * Handles selection of pipeline on table
   */
  onPipelineClicked(row) {

    console.log('Row clicked: ', row);
    let currentPipelineSelected = null;

    console.log("On pipeline clicked - row clicked  selected: ", this.pipelineSelection.isSelected(row));



    if (this.pipelineSelection.hasValue()) {
      console.log("pipelineSelection has value");

      if (this.pipelineSelection.selected[0].uid == row.uid &&
        this.pipelineSelection.selected[0] != row) {

        this.pipelineSelection.select(row);
        this.pipelineSelected = true;

      }

      currentPipelineSelected = this.pipelineSelection.selected[0]
    }

    // Skip if same row is selected
    if (currentPipelineSelected == null || currentPipelineSelected.uid != row.uid) {
      console.log("Not Skipping as same row is not selected row uid", row.uid);



      // Clear previous selection and editor
      if (currentPipelineSelected != null) {
        console.log("Not Skipping as same row is not selected currentselection uid", currentPipelineSelected.uid);
        this.pipelineSelection.clear();
        this.clearPipeline();
      }

      this.pipelineSelection.select(row);
      this.pipelineSelected = true;

      // Update Pipeline Form
      this.pipelineForm.reset({
        uid: row.uid,
        name: row.name,
        pipelineType: row.pipelineType,
        description: row.description,
        status: row.status,
        flowConfiguration: row.flowConfiguration,
        logLevel: row.logLevel
      }, { emitEvent: false });

      // Reset the editor
      let decodedData = decodeURIComponent(row.flowConfiguration);
      let jsonData = JSON.parse(decodedData)
      this.editor.fromJSON(jsonData);

      // Reset command buttons
      console.log("Resetting buttons for status: ", row.status);

      if (row.status == "Saved") {
        this.deployDisabled = false;
        this.undeployDisabled = true;

      }
      else if (row.status == "Deployed") {
        this.deployDisabled = true;
        this.undeployDisabled = false;
      }
      else {
        this.deployDisabled = true;
        this.undeployDisabled = true;
      }

    }
    else {
      console.log("skipping as same row is selected");

    }


  }

  newPipeline() {
    console.log("Deleting pipeline: ", this.pipelineForm);

    if (this.pipelineSelection.hasValue()) {

      this.pipelineSelected = false;

      let pipeline = this.pipelineSelection.selected[0]

      this.pipelineSelection.clear();

      this.clearPipeline();
    }
  }

  savePipelineToGraph() {
    let editorData = this.editor.toJSON();

    let pipelineName = this.pipelineForm.get('name').value;
    let pipelineId = this.pipelineForm.get('uid').value;
    let pipelineType = this.pipelineForm.get('pipelineType').value;
    if (pipelineName == "" || pipelineType == "") {
      this._snackBar.open("Failure", "Pipeline needs a name and type", {
        duration: 3000,
      });
    }
    else if (pipelineId != "") {
      this.updatePipelineToGraph(true);
    }
    else {
      console.log("Saved editor data: ", editorData);

      // Save pipeline
      let pipeline = new Pipeline();
      let tsms = Date.now();
      pipeline.created = tsms;
      pipeline.modified = tsms;
      pipeline.name = this.pipelineForm.get('name').value;
      pipeline.pipelineType = this.pipelineForm.get('pipelineType').value;
      pipeline.description = this.pipelineForm.get('description').value;
      pipeline.status = "Saved";
      pipeline.flowConfiguration = encodeURIComponent(JSON.stringify(editorData));
      pipeline.logLevel = this.pipelineForm.get('logLevel').value;

      // Add pipeline to graph
      this.graphService.addPipeline(this.gateway.uid, pipeline, "", "", null, null)
        .subscribe(res => {
          console.log("Added pipeline: ", res);

          this.getGatewayAndPipelines(this.gatewayId, pipeline);

          let message = 'Success';
          if (res == undefined) {
            message = 'Failure';
          }

          this._snackBar.open(message, "Save Pipeline", {
            duration: 3000,
          });

        });
    }

  }

  updatePipelineToGraph(showSnackbar: boolean) {

    let editorData = this.editor.toJSON();

    // Update pipeline
    let pipeline = new Pipeline();
    let tsms = Date.now();
    pipeline.modified = tsms;
    pipeline.name = this.pipelineForm.get('name').value;
    pipeline.uid = this.pipelineForm.get('uid').value;
    pipeline.description = this.pipelineForm.get('description').value;
    pipeline.status = this.pipelineForm.get('status').value;
    pipeline.flowConfiguration = encodeURIComponent(JSON.stringify(editorData));
    pipeline.logLevel = this.pipelineForm.get('logLevel').value;

    // Add pipeline to graph
    this.graphService.updatePipeline(pipeline)
      .subscribe(res => {
        console.log("Updated pipeline: ", res);

        this.getGatewayAndPipelines(this.gatewayId, pipeline)

        if (showSnackbar) {
          let message = 'Success';
          if (res == undefined) {
            message = 'Failure';
          }

          this._snackBar.open(message, "Update Pipeline", {
            duration: 3000,
          });
        }

      });

  }


  /**
     * deletePipelineFromGraph
     */
  deletePipelineFromGraph() {
    console.log("Deleting pipeline: ", this.pipelineForm);

    if (this.pipelineSelection.hasValue()) {

      this.pipelineSelected = false;
      this.deployDisabled = true;
      this.undeployDisabled = true;

      let pipeline = this.pipelineSelection.selected[0]

      // if (pipeline.status != "Undeployed") {
      //   this.undeploySelectedDataPipeline();
      // }
      this.pipelineSelection.clear();

      this.graphService.deletePipeline(this.gateway.uid, pipeline)
        .subscribe(res => {
          console.log("Result from delete pipeline", res);

          this.getGatewayAndPipelines(this.gatewayId, null);

          // Clear the editor
          this.clearPipeline();

          // this.resetPipelineForm();
        });
    }
    else {
      console.log("No selection to delete");

    }
  }


  clearPipeline() {
    // var nodeInstance = this.editor.nodes[0];

    // this.editor.removeNode(nodeInstance)

    this.editor.clear();

    this.pipelineConfig = true;
    this.dataSourceConfig = false;
    this.filteringConfig = false;
    this.dataStoreConfig = false;
    this.dataPipeConfig = false;
    this.inferencingConfig = false;
    this.rulesConfig = false;
    this.streamingConfig = false;
    this.flogoFlowConfig = false;

    this.pipelineForm.patchValue({
      uid: "",
      name: "",
      pipelineType: "",
      description: "",
      status: "",
      logLevel: "INFO"
    });

  }

  printPipeline() {
    let flowData = this.editor.toJSON();

    console.log("Editor Flow Data: ", flowData);

    console.log("First node: ", this.findDataSourceFlowNode(flowData));


  }

  buildPipelineRequest(): any {

    let deployType = this.pipelineForm.get('pipelineType').value;
    let appLogLevel = this.pipelineForm.get('logLevel').value;
    let systemEnv = {};
    let extra = [];

    console.log("Building pipeline request for gateway: ", this.gateway);


    if (deployType == "Edge") {
      systemEnv = {
        "Platform": this.gateway.platform,
        "DetachedMode": "n",
        "Username": this.gateway.username,
        "TargetServer": this.gateway.router,
        "Port": this.gateway.routerPort
      };

      extra = [
        { "Name": "App.LogLevel", "Value": appLogLevel },
        { "Name": "networks.default.external.name", "Value": this.gateway.deployNetwork }
      ];
    }

    let pipelineFlow = {
      "ComponentType": "Service",
      "ServiceType": "docker",
      "AirDescriptor": {
        "source": {},
        "logic": [],
        "extra": extra
      },
      "ScriptSystemEnv": systemEnv
    };

    try {

      let flow = this.editor.toJSON();
      let pos = 0;
      let rulePos = 0;
      console.log("Building from: ", flow);

      Object.keys(flow.nodes).forEach(key => {
        const outputJson = flow.nodes[key];

        console.log("Building from : ", key);


        console.log("Building: ", flow.nodes[key].name);

        if (flow.nodes[key].name == "Data Source") {
          pipelineFlow.AirDescriptor.source = this.buildDataSourceDeployObj(flow.nodes[key].data.customdata);
        }
        else {
          // Add logic nodes
          switch (flow.nodes[key].name) {
            case "Data Store": {
              pipelineFlow.AirDescriptor.logic.push(this.buildDataStoreDeployObj(flow.nodes[key].data.customdata));
              break;
            }
            case "Data Pipe": {
              pipelineFlow.AirDescriptor.logic.push(this.buildDataPipeDeployObj(flow.nodes[key].data.customdata));
              break;
            }
            case "Custom Pipe": {
              pipelineFlow.AirDescriptor.logic.push(this.buildCustomPipeDeployObj(flow.nodes[key].data.customdata));

              break;
            }
            case "Notification Pipe": {
              pipelineFlow.AirDescriptor.logic.push(this.buildDataPipeDeployObj(flow.nodes[key].data.customdata));

              let pipeId = "Pipe_" + pos;
              let ruleId = "Rule_" + rulePos;
              let listener = {
                "Name": "App.NotificationListeners",
                "Value": "{\"" + ruleId + "\":" + "[\"" + pipeId + "\"]}",
              };
              extra.push(listener);

              break;
            }
            case "Filters": {
              pipelineFlow.AirDescriptor.logic.push(this.buildFiltersDeployObj(flow.nodes[key].data.customdata));
              break;
            }
            case "Inferencing": {
              pipelineFlow.AirDescriptor.logic.push(this.buildInferencingDeployObj(flow.nodes[key].data.customdata));
              break;
            }
            case "Streaming": {
              pipelineFlow.AirDescriptor.logic.push(this.buildStreamingDeployObj(flow.nodes[key].data.customdata));
              break;
            }
            case "Rules": {
              pipelineFlow.AirDescriptor.logic.push(this.buildRulesDeployObj(flow.nodes[key].data.customdata));
              rulePos = pos;
              break;
            }
            case "Flogo Flow": {
              pipelineFlow.AirDescriptor.logic.push(this.buildFlogoFlowDeployObj(flow.nodes[key].data.customdata));
              break;
            }
          }
          pos++;

        }

      });

      pipelineFlow.AirDescriptor.logic.push(
        {
          "name": "Filter.Dummy",
          "properties": [
            { "Name": "Logging.LogLevel", "Value": "DEBUG" }
          ]
        }
      );

      console.log("Pipeline flow to be build: ", pipelineFlow);
      console.log("Pipeline flow to be build string: ", JSON.stringify(pipelineFlow));

    }
    catch (e) {
      console.log("Error: ", e)

      pipelineFlow = null;
    }

    return pipelineFlow;

  }

  validatePipeline() {

    let pipelineId = this.pipelineForm.get('uid').value;
    let pipelineFlow = this.buildPipelineRequest();

    if (pipelineFlow != null) {
      this.flogoDeployService.validateF1(pipelineId, pipelineFlow)
        .subscribe(res => {
          console.log("Received Validation response: ", res);

          console.log("Received Validation response code: ", res.Success);

          let message = 'Success';
          if (res == undefined || res.Success == false) {
            message = 'Failure';
          }

          this._snackBar.open(message, "Pipeline Validated", {
            duration: 3000,
          });

        });
    }
    else {
      this._snackBar.open("Error", "Pipeline Validated", {
        duration: 3000,
      });
    }



  }

  deployPipeline() {

    let pipelineId = this.pipelineForm.get('uid').value;
    let pipelineFlow = this.buildPipelineRequest();

    if (pipelineFlow != null) {
      this.flogoDeployService.deployF1(pipelineId, pipelineFlow)
        .subscribe(res => {
          console.log("Received Deployment response: ", res);

          this.pipelineForm.patchValue({
            status: "Deployed",
          });

          this.updatePipelineToGraph(false);

          this.deployDisabled = true;
          this.undeployDisabled = false;

          let message = 'Success';
          if (res == undefined || res.Success == false) {
            message = 'Failure';
          }

          this._snackBar.open(message, "Deploy Pipeline", {
            duration: 3000,
          });

        });
    }
    else {
      this._snackBar.open("Error", "Pipeline Validated", {
        duration: 3000,
      });
    }

  }


  undeployPipeline() {


    let pipelineId = this.pipelineForm.get('uid').value;
    let deployType = this.pipelineForm.get('pipelineType').value;

    let systemEnv = {};

    if (deployType == "Edge") {
      systemEnv = {
        "Username": this.gateway.username,
        "TargetServer": this.gateway.router,
        "Port": this.gateway.routerPort
      };
    }

    let pipelineFlow = {
      "Method": "Script",
      "ScriptSystemEnv": systemEnv
    };

    console.log("Undeploy Pipeline flow: ", pipelineId);

    this.flogoDeployService.undeployF1(pipelineId, pipelineFlow)
      .subscribe(res => {
        console.log("Received Undeploy response: ", res);

        this.pipelineForm.patchValue({
          status: "Saved",
        });

        this.updatePipelineToGraph(false);

        this.deployDisabled = false;
        this.undeployDisabled = true;

        let message = 'Success';
        if (res == undefined || res.Success == false) {
          message = 'Failure';
        }

        this._snackBar.open(message, "Undeploy Pipeline", {
          duration: 3000,
        });

      });

  }


  buildDataSourceDeployObj(contextObj): any {

    let sourceType = "";
    if (contextObj.topic == "edgexevents") {
      sourceType = "DataSource.EDGEX_" + contextObj.protocol;
    }
    else {
      sourceType = "DataSource." + contextObj.protocol;
    }
    let sourceObj = {
      name: sourceType,
      properties: this.buildSubscriberDeployProperties(contextObj)
    };

    return sourceObj;
  }

  buildDataPipeDeployObj(contextObj): any {
    // let pipeType = "Pipe." + contextObj.protocol + "2";
    let pipeType = "Pipe." + contextObj.protocol + "_OLD";
    let pipeObj = {
      name: pipeType,
      properties: this.buildPublisherDeployProperties(contextObj)
    };

    return pipeObj;
  }


  buildCustomPipeDeployObj(contextObj): any {
    let pipeType = "Pipe." + contextObj.protocol + "_FS";
    let pipeObj = {
      name: pipeType,
      properties: this.buildPublisherDeployProperties(contextObj)
    };

    pipeObj.properties.push({ "Name": "MQTTPub.PublishData", "Value": "@Inference.REST..Inferred@" });

    return pipeObj;
  }

  /**
   *
   * @param contextObj
   */
  buildSubscriberDeployProperties(contextObj): any {

    let protocolObj = null;

    if (contextObj.protocol == "MQTT") {

      let encpass = "SECRET:" + btoa(contextObj.password);

      protocolObj = [
        { "Name": "Data.Gateway", "Value": this.gatewayId },
        { "Name": "MQTTTrigger.Topic", "Value": contextObj.topic },
        { "Name": "MQTTTrigger.MaximumQOS", "Value": contextObj.maximumQOS },
        { "Name": "Mqtt.IoTMQTT.Broker_URL", "Value": "tcp://" + contextObj.hostname + ":" + contextObj.port },
        { "Name": "Mqtt.IoTMQTT.Username", "Value": contextObj.username },
        { "Name": "Mqtt.IoTMQTT.Password", "Value": encpass },
        { "Name": "Mqtt.encryptionMode", "Value": "changeme" },
        { "Name": "Mqtt.caCertificate", "Value": "changeme" },
        { "Name": "Mqtt.clientCertificate", "Value": "changeme" },
        { "Name": "Mqtt.clientKey", "Value": "changeme" },
        { "Name": "Logging.LogLevel", "Value": "DEBUG" }
      ];
    }
    else if (contextObj.protocol == "Kafka") {

      protocolObj = [
        { "Name": "Kafka.IoTKafka.Brokers", "Value": "hostname" + ":" + "port" },
        { "Name": "Kafka.IoTKafka.Connection_Timeout", "Value": "connectionTimeout" },
        { "Name": "Kafka.IoTKafka.Retry_Backoff", "Value": "retryBackoff" },
        { "Name": "Kafka.IoTKafka.AuthMode", "Value": "authMode" },
        { "Name": "Kafka.IoTKafka.Username", "Value": "username" },
        { "Name": "Kafka.IoTKafka.Password", "Value": "password" },
        { "Name": "Kafka.IoTKafka.ClientCertificate", "Value": "clientCertificate" },
        { "Name": "Kafka.IoTKafka.ClientKey", "Value": "clientKey" },
        { "Name": "Kafka.IoTKafka.ServerCertificate", "Value": "serverCertificate" },
        { "Name": "KafkaTrigger.ConsumerGroupId", "Value": "consumerGroupId" },
        { "Name": "KafkaTrigger.Topic", "Value": "topic" },
        { "Name": "KafkaTrigger.SessionTimeout", "Value": "sessionTimeout" },
        { "Name": "KafkaTrigger.CommitInterval", "Value": "commitInterval" },
        { "Name": "KafkaTrigger.InitialOffset", "Value": "initialOffset" },
        { "Name": "KafkaTrigger.FetchMinBytes", "Value": "fetchMinBytes" },
        { "Name": "KafkaTrigger.FetchMaxWait", "Value": "fetchMaxWait" },
        { "Name": "KafkaTrigger.HeartbeatInterval", "Value": "heartbeatInterval" }
      ];
    }

    console.log(">>> Build protocol properties: ", contextObj);
    console.log(">>> Build protocol properties: ", protocolObj);


    return protocolObj;

  }

  /**
   *
   * @param contextObj
   */
  buildPublisherDeployProperties(contextObj): any {

    let protocolObj = null;

    if (contextObj.protocol == "MQTT") {

      let encpass = "SECRET:" + btoa(contextObj.password);

      protocolObj = [
        { "Name": "MQTTPub.Topic", "Value": contextObj.topic },
        { "Name": "MQTTPub.MaximumQOS", "Value": contextObj.maximumQOS },
        { "Name": "Mqtt.IoTMQTT.Broker_URL", "Value": "tcp://" + contextObj.hostname + ":" + contextObj.port },
        { "Name": "Mqtt.IoTMQTT.Username", "Value": contextObj.username },
        { "Name": "Mqtt.IoTMQTT.Password", "Value": encpass },
        { "Name": "Mqtt.encryptionMode", "Value": "changeme" },
        { "Name": "Mqtt.caCertificate", "Value": "changeme" },
        { "Name": "Mqtt.clientCertificate", "Value": "changeme" },
        { "Name": "Mqtt.clientKey", "Value": "changeme" },
        { "Name": "Logging.LogLevel", "Value": "DEBUG" }
      ];
    }
    else if (contextObj.protocol == "Kafka") {

      protocolObj = [
        { "Name": "Kafka.IoTKafka.Brokers", "Value": "hostname" + ":" + "port" },
        { "Name": "Kafka.IoTKafka.Connection_Timeout", "Value": "connectionTimeout" },
        { "Name": "Kafka.IoTKafka.Retry_Backoff", "Value": "retryBackoff" },
        { "Name": "Kafka.IoTKafka.AuthMode", "Value": "authMode" },
        { "Name": "Kafka.IoTKafka.Username", "Value": "username" },
        { "Name": "Kafka.IoTKafka.Password", "Value": "password" },
        { "Name": "Kafka.IoTKafka.ClientCertificate", "Value": "clientCertificate" },
        { "Name": "Kafka.IoTKafka.ClientKey", "Value": "clientKey" },
        { "Name": "Kafka.IoTKafka.ServerCertificate", "Value": "serverCertificate" },
        { "Name": "KafkaTrigger.ConsumerGroupId", "Value": "consumerGroupId" },
        { "Name": "KafkaTrigger.Topic", "Value": "topic" },
        { "Name": "KafkaTrigger.SessionTimeout", "Value": "sessionTimeout" },
        { "Name": "KafkaTrigger.CommitInterval", "Value": "commitInterval" },
        { "Name": "KafkaTrigger.InitialOffset", "Value": "initialOffset" },
        { "Name": "KafkaTrigger.FetchMinBytes", "Value": "fetchMinBytes" },
        { "Name": "KafkaTrigger.FetchMaxWait", "Value": "fetchMaxWait" },
        { "Name": "KafkaTrigger.HeartbeatInterval", "Value": "heartbeatInterval" }
      ];
    }
    else if (contextObj.protocol == "AMQP") {

      protocolObj = [
        { "Name": "AMQP.url", "Value": "amqp://" + contextObj.username + ":" + contextObj.password + "@" + contextObj.hostname + ":" + contextObj.port + "/" },
        { "Name": "AMQP.exchangeName", "Value": contextObj.exchangeName },
        { "Name": "AMQP.exchangeType", "Value": contextObj.exchangeType },
        { "Name": "AMQP.routingKey", "Value": contextObj.routingKey },
        { "Name": "AMQP.reliable", "Value": contextObj.reliable }
      ];
    }

    console.log(">>> Build protocol properties: ", contextObj);
    console.log(">>> Build protocol properties: ", protocolObj);


    return protocolObj;

  }

  buildDataStoreDeployObj(contextObj): any {
    let dataStoreType = "DataStore." + contextObj.dataStore;
    let sourceObj = {
      name: dataStoreType,
      properties: this.buildDataStoreDeployProperties(contextObj)
    };

    return sourceObj;
  }

  /**
   *
   * @param protocol
   * @param form
   */
  buildDataStoreDeployProperties(contextObj): any {

    let dataStoreObj = null;
    let encpass = "SECRET:" + btoa(contextObj.password);

    if (contextObj.dataStore == "PostgreSQL") {

      dataStoreObj = [
        { "Name": "PostgreSQL.IoTPostgres.Host", "Value": contextObj.host },
        { "Name": "PostgreSQL.IoTPostgres.Port", "Value": contextObj.port.toString() },
        { "Name": "PostgreSQL.IoTPostgres.Database_Name", "Value": contextObj.databaseName },
        { "Name": "PostgreSQL.IoTPostgres.User", "Value": contextObj.user },
        { "Name": "PostgreSQL.IoTPostgres.Password", "Value": contextObj.password },
        { "Name": "Logging.LogLevel", "Value": "DEBUG" }
      ];
    }
    else if (contextObj.dataStore == "Snowflake") {

      dataStoreObj = [
        { "Name": "", "Value": contextObj.accountName },
        { "Name": "", "Value": contextObj.accountName },
        { "Name": "", "Value": contextObj.database },
        { "Name": "", "Value": contextObj.schema },
        { "Name": "", "Value": contextObj.authType },
        { "Name": "", "Value": contextObj.username },
        { "Name": "", "Value": contextObj.password },
        { "Name": "", "Value": contextObj.clientId },
        { "Name": "", "Value": contextObj.clientSecret },
        { "Name": "", "Value": contextObj.authorizationCode },
        { "Name": "", "Value": contextObj.redirectURI },
        { "Name": "", "Value": contextObj.loginTimeout }
      ];
    }
    else if (contextObj.dataStore == "TGDB") {

      dataStoreObj = [
        { "Name": "GraphBuilder_TGDB.IoTTGDB.TGDB_Server_URL", "Value": contextObj.url },
        { "Name": "GraphBuilder_TGDB.IoTTGDB.Username", "Value": contextObj.username },
        { "Name": "GraphBuilder_TGDB.IoTTGDB.Password", "Value": contextObj.password }
      ];
    }
    else if (contextObj.dataStore = "Dgraph") {

      dataStoreObj = [
        { "Name": "GraphBuilder_dgraph.IoTDgraph.Dgraph_Server_URL", "Value": contextObj.url },
        { "Name": "GraphBuilder_dgraph.IoTDgraph.Username", "Value": contextObj.username },
        { "Name": "GraphBuilder_dgraph.IoTDgraph.Password", "Value": contextObj.password }
      ];

    };

    return dataStoreObj;

  }

  buildFiltersDeployObj(contextObj): any {
    let filtersType = "Filter.Default";
    let filterObj = {
      name: filtersType,
      properties: this.buildFiltersDeployProperties(contextObj)
    };

    return filterObj;

  }

  /**
   * @param contextObj
   */
  buildFiltersDeployProperties(contextObj): any {

    let filterObj = [
      { "Name": "Logging.LogLevel", "Value": "DEBUG" },
      { "Name": "Filter.Conditions", "Value": JSON.stringify(contextObj.filters) }
    ];

    return filterObj;
  }

  buildInferencingDeployObj(contextObj): any {

    console.log("Inference Context: ", contextObj);

    let inferencingType = "Inference.REST";
    let inferencingObj = {
      name: inferencingType,
      properties: this.buildInferencingDeployProperties(contextObj)
    };

    return inferencingObj;

  }

  /**
   * @param contextObj
   */
  buildInferencingDeployProperties(contextObj): any {

    var platformDetails = contextObj.modelPlatform.split("|");
    let inferenceData = {};
    let urlMapping = [];

    console.log("Inference details: ", platformDetails);

    if (platformDetails[0] == "nvidia") {
      inferenceData = {
        "image": "@f1..value@",
        "network": platformDetails[2],
        "id": "@f1..id@"
      }

      let mapping = {
        "Alias": "0",
        "URL": contextObj.modelUrl + "/v1/" + platformDetails[1]
      };
      urlMapping.push(mapping);

    }


    let filterObj = [
      { "Name": "Logging.LogLevel", "Value": "DEBUG" },
      { "Name": "REST.Timeout", "Value": "10000" },
      { "Name": "REST.InferenceData", "Value": JSON.stringify(inferenceData) },
      { "Name": "REST.Conditions", "Value": JSON.stringify(contextObj.filters) },
      { "Name": "REST.URLMapping", "Value": JSON.stringify(urlMapping) }
    ];

    return filterObj;
  }

  buildStreamingDeployObj(contextObj): any {

    console.log("Streaming Context: ", contextObj);

    let streamingType = "Aggregate.Stream";
    let streamingObj = {
      name: streamingType,
      properties: this.buildStreamingDeployProperties(contextObj)
    };

    return streamingObj;

  }

  /**
   * @param contextObj
   */
  buildStreamingDeployProperties(contextObj): any {

    let streamingObj = [
      { "Name": "Logging.LogLevel", "Value": "DEBUG" },
      { "Name": "Streaming.ProceedOnEmit", "Value": "true" },
      { "Name": "Streaming.Resolution", "Value": "1" },
      // { "Name": "Streaming.InputField", "Value": "f1..value" },
      { "Name": "Streaming.DeviceName", "Value": contextObj.deviceName },
      { "Name": "Streaming.InstrumentName", "Value": contextObj.instrumentName },
      { "Name": "Streaming.Function", "Value": contextObj.function },
      { "Name": "Streaming.WindowType", "Value": contextObj.windowType },
      { "Name": "Streaming.WindowSize", "Value": contextObj.windowSize }
    ];

    return streamingObj;
  }

  buildRulesDeployObj(contextObj): any {

    console.log("Rules Context: ", contextObj);

    let ruleType = "Rule.Default";
    let ruleObj = {
      name: ruleType,
      properties: this.buildRulesDeployProperties(contextObj)
    };

    return ruleObj;

  }

  /**
   * @param contextObj
   */
  buildRulesDeployProperties(contextObj): any {

    let ruleDescriptor = {
      "actionDevice": contextObj.actionDevice,
      "actionNotification": contextObj.actionNotification,
      "actionResource": contextObj.actionResource,
      "actionSendCommand": contextObj.actionSendCommand,
      "actionSendNotification": contextObj.actionSendNotification,
      "actionValue": contextObj.actionValue,
      "condCompareLastMetricToValue": contextObj.condCompareLastMetricToValue,
      "condCompareLastMetricToValueOp": contextObj.condCompareLastMetricToValueOp,
      "condCompareLastMetricValue": contextObj.condCompareLastMetricValue,
      "condCompareNewMetricToLastMetric": contextObj.condCompareNewMetricToLastMetric,
      "condCompareNewMetricToLastMetricOp": contextObj.condCompareNewMetricToLastMetricOp,
      "condCompareNewMetricToValue": contextObj.condCompareNewMetricToValue,
      "condCompareNewMetricToValueOp": contextObj.condCompareNewMetricToValueOp,
      "condCompareNewMetricValue": contextObj.condCompareNewMetricValue,
      "condDevice": contextObj.condDevice,
      "condResource": contextObj.condResource,
      "created": 1615472546736,
      "description": contextObj.description,
      "modified": 1615472546736,
      "name": contextObj.name,
      "uuid": "Test"
    }

    let ruleObj = [
      { "Name": "Logging.LogLevel", "Value": contextObj.logLevel },
      { "Name": "Rule.TupleDescriptor", "Value": JSON.stringify(this.ruleTuplesDescriptor) },
      { "Name": "Rule.DefaultRuleDescriptor", "Value": JSON.stringify(ruleDescriptor) },
    ];

    return ruleObj;
  }

  buildFlogoFlowDeployObj(contextObj): any {

    console.log("Flogo Flow Context: ", contextObj);

    let flogoFlowType = "Flogo.Default";
    let flogoFlowObj = {
      name: flogoFlowType,
      flogoApp: contextObj.flowDefinition,
      properties: this.buildFlogoFlowDeployProperties(contextObj),
      ports: ["9090:9999"]
    };

    return flogoFlowObj;

  }

  /**
   * @param contextObj
   */
  buildFlogoFlowDeployProperties(contextObj): any {

    let flogoFlowPropertiesObj = contextObj.flowProperties;

    return flogoFlowPropertiesObj;
  }


}

