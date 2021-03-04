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
import { ErrorHandlerComponent } from "../rete/components/error-handler-component";
import { ImageResizeComponent } from "../rete/components/image-resize-component";
import { InferencingComponent } from "../rete/components/inferencing-component";
import { RulesComponent } from "../rete/components/rules-component";
import { StreamingComponent } from "../rete/components/streaming-component";
import { pipe } from 'rxjs';
import { DataFilteringComponent } from '../iot-data-pipeline/data-filtering/data-filtering.component';



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

  lastNodeSelected = null;

  filters: any[] = [];

  pipelineForm: FormGroup;
  protocolForm: FormGroup;
  dataStoreForm: FormGroup;
  streamingForm: FormGroup;
  modelForm: FormGroup;


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

    console.log("================>>>>>>>>>>>************* ngAfterViewInit called");


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
      new ErrorHandlerComponent()
    ];

    this.editor = new NodeEditor("demo@0.2.0", container);

    this.editor.use(ConnectionPlugin);
    console.log("AngularRenderPlugin", AngularRenderPlugin);
    this.editor.use(AngularRenderPlugin); //, { component: MyNodeComponent });
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

    this.editor.view.resize();
    this.editor.trigger("process");
    // zoomAt(editor);

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
    this.streamingConfig = false;

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
    }, { emitEvent: false });

    this.protocolForm.patchValue({
      protocolId: '',
      protocol: '',
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
      protocolType: ['', Validators.required],
      protocolId: ['', Validators.required],
      dataStoreType: ['', Validators.required],
      dataStoreId: ['', Validators.required],
      status: ['', Validators.required]
    });

    this.protocolForm = this.formBuilder.group({
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
      windowSize: ['5', Validators.required]
    });

    this.modelForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      inputType: ['', Validators.required],
      url: ['', Validators.required],
      platform: ['', Validators.required],
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
        "prtocolId": form.get('protocolId').value,
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
        "prtocolId": form.get('protocolId').value,
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
        "url": form.get('tgdb.url').value,
        "username": form.get('tgdb.username').value,
        "password": form.get('tgdb.password').value,
      }
    }
    else if (dataStore = "Dgraph") {

      dataStoreObj = {
        "dataStore": form.get('dataStore').value,
        "dataStoreId": form.get('dataStoreId').value,
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
      "filters": this.inferenceComponent.getFilters()
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
      "windowSize": this.streamingForm.get('windowSize').value
    };

    return streamingObj;
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
        platform: context.modelPlatform
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
        windowSize: context.windowSize
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
        prototypeType: row.protocolType,
        dataStoreType: row.dataStoreType,
        status: row.status,
      }, { emitEvent: false });

      // Reset the editor
      let decodedData = decodeURIComponent(row.protocolType);
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

      // this.updateProtocolViewForm(row.protocolType, row.protocol);

      // this.updateDataStoreViewForm(row.dataStoreType, row.dataStore);

      // this.updateFilterViewForm(row.filter);

      // this.updateStreamingViewForm(row.streaming)
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

    console.log("Saved editor data: ", editorData);

    // Save pipeline
    let pipeline = new Pipeline();
    let tsms = Date.now();
    pipeline.created = tsms;
    pipeline.modified = tsms;
    pipeline.name = this.pipelineForm.get('name').value;
    pipeline.pipelineType = this.pipelineForm.get('pipelineType').value;
    pipeline.protocolType = "flow";
    pipeline.protocolType = encodeURIComponent(JSON.stringify(editorData));
    // pipeline.dataStoreType = this.pipelineForm.get('dataStoreType').value;
    pipeline.status = "Saved";

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

  updatePipelineToGraph() {


    // Update pipeline
    let pipeline = new Pipeline();
    let tsms = Date.now();
    pipeline.modified = tsms;
    pipeline.name = this.pipelineForm.get('name').value;
    pipeline.uid = this.pipelineForm.get('uid').value;
    pipeline.status = this.pipelineForm.get('status').value;

    // Add pipeline to graph
    this.graphService.updatePipeline(pipeline)
      .subscribe(res => {
        console.log("Updated pipeline: ", res);

        this.getGatewayAndPipelines(this.gatewayId, pipeline)

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
    this.streamingConfig = false;

    this.pipelineForm.patchValue({
      name: "",
      pipelineType: "",
      description: ""
    });

  }

  printPipeline() {
    let flowData = this.editor.toJSON();

    console.log("Editor Flow Data: ", flowData);

    console.log("First node: ", this.findDataSourceFlowNode(flowData));


  }

  deployPipeline() {

    let pipelineId = this.pipelineForm.get('uid').value;
    let deployType = this.pipelineForm.get('pipelineType').value;
    let systemEnv = {};
    let extra = [];

    if (deployType == "Edge") {
      systemEnv = {
        "Platform": "linux/arm64",
        "DetachedMode": "n",
        "Username": "ubuntu",
        "TargetServer": "76.208.102.187"
      };

      extra = [
        { "Name": "networks.default.external.name", "Value": "hanoi_edgex-network" }
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

    let flow = this.editor.toJSON();

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
          default: {

            break;
          }
        }

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


    // let pipelineFlow1 = {
    //   "ComponentType": "Service",
    //   "ServiceType": "docker",
    //   "AirDescriptor": {
    //     "source": {
    //       "name": "DataSource.MQTT",
    //       "properties": [
    //         { "Name": "Mqtt.IoTMQTT.Broker_URL", "Value": "tcp://a51c54c751c2a4a8eba0650958d6b261-1634817950.us-west-2.elb.amazonaws.com:443" },
    //         { "Name": "MQTTTrigger.Topic", "Value": "EdgexGatewayData" },
    //         { "Name": "MQTTTrigger.MaximumQOS", "Value": "2" },
    //         { "Name": "Mqtt.IoTMQTT.Username", "Value": "mqtt_admin" },
    //         { "Name": "Mqtt.IoTMQTT.Password", "Value": "SECRET:bXF0dF9hZG1pbg==" }
    //       ]
    //     },
    //     "logic": [
    //       {
    //         "name": "Filter.Dummy",
    //         "properties": [
    //           { "Name": "Logging.LogLevel", "Value": "INFO" }
    //         ]
    //       },
    //       {
    //         "name": "Pipe.MQTT",
    //         "properties": [
    //           { "Name": "Mqtt.IoTMQTT.Broker_URL", "Value": "tcp://a51c54c751c2a4a8eba0650958d6b261-1634817950.us-west-2.elb.amazonaws.com:443" },
    //           { "Name": "Mqtt.IoTMQTT.Username", "Value": "mqtt_admin" },
    //           { "Name": "Mqtt.IoTMQTT.Password", "Value": "SECRET:bXF0dF9hZG1pbg==" },
    //           { "Name": "Logging.LogLevel", "Value": "DEBUG" },
    //           { "Name": "MQTTPub.Topic", "Value": "AIRModelScoredData01" }
    //         ]
    //       },
    //       {
    //         "name": "Pipe.MQTT",
    //         "properties": [
    //           { "Name": "Mqtt.IoTMQTT.Broker_URL", "Value": "tcp://a51c54c751c2a4a8eba0650958d6b261-1634817950.us-west-2.elb.amazonaws.com:443" },
    //           { "Name": "Mqtt.IoTMQTT.Username", "Value": "mqtt_admin" },
    //           { "Name": "Mqtt.IoTMQTT.Password", "Value": "SECRET:bXF0dF9hZG1pbg==" },
    //           { "Name": "Logging.LogLevel", "Value": "DEBUG" },
    //           { "Name": "MQTTPub.Topic", "Value": "AIRModelScoredData02" }
    //         ]
    //       }
    //     ],
    //     "extra": []
    //   },
    //   "ScriptSystemEnv": {
    //     "Platformx": "linux/amd64",
    //     "Platform": "linux/arm64",
    //     "DetachedMode": "n",
    //     "Username": "ubuntu",
    //     "TargetServer": "76.208.102.187"
    //   }
    // };

    // console.log("Pipeline flow to be build work: ", pipelineFlow1);

    this.flogoDeployService.deployF1(pipelineId, pipelineFlow)
      .subscribe(res => {
        console.log("Received Deployment response: ", res);

        this.pipelineForm.patchValue({
          status: "Deployed",
        });

        this.updatePipelineToGraph();

        this.deployDisabled = true;
        this.undeployDisabled = false;

        let message = 'Success';
        if (res == undefined) {
          message = 'Failure';
        }

        this._snackBar.open(message, "Deploy Pipeline", {
          duration: 3000,
        });

      });


  }

  undeployPipeline() {


    let pipelineId = this.pipelineForm.get('uid').value;
    let deployType = this.pipelineForm.get('pipelineType').value;

    let systemEnv = {};

    if (deployType == "Edge") {
      systemEnv = {
        "Username": "ubuntu",
        "TargetServer": "76.208.102.187"
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

        this.updatePipelineToGraph();

        this.deployDisabled = false;
        this.undeployDisabled = true;

        let message = 'Success';
        if (res == undefined) {
          message = 'Failure';
        }

        this._snackBar.open(message, "Undeploy Pipeline", {
          duration: 3000,
        });

      });

  }


  buildDataSourceDeployObj(contextObj): any {

    let sourceType = "";
    if (contextObj.topic == "airevents") {
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
        "network": platformDetails[2]
      }

      let mapping = {
        "Alias": "0",
        "URL": contextObj.modelUrl + "/v1/" + platformDetails[1]
      };
      urlMapping.push(mapping);

    }


    let filterObj = [
      { "Name": "Logging.LogLevel", "Value": "DEBUG" },

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

}
