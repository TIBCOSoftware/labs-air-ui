import { Component, AfterViewInit, ViewChild, ElementRef, Input } from "@angular/core";

import { NodeEditor, Engine } from "rete";
import ConnectionPlugin from "rete-connection-plugin";
import { AngularRenderPlugin } from "rete-angular-render-plugin";
import ContextMenuPlugin from "rete-context-menu-plugin";
import { zoomAt } from "rete-area-plugin";

import { DataStoreComponent } from "../../rete/components/data-store-component";
import { DataSourceComponent } from "../../rete/components/data-source-component";
import { FiltersComponent } from "../../rete/components/filters-component";
import { DataPipeComponent } from "../../rete/components/data-pipe-component";
import { ErrorHandlerComponent } from "../../rete/components/error-handler-component";
import { ImageResizeComponent } from "../../rete/components/image-resize-component";
import { InferencingComponent } from "../../rete/components/inferencing-component";
import { RulesComponent } from "../../rete/components/rules-component";
import { StreamingComponent } from "../../rete/components/streaming-component";
import { last } from "rxjs/operators";
import { Device, Gateway, Pipeline } from "src/app/shared/models/iot.model";
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';



@Component({
  selector: 'app-pipeline-editor',
  templateUrl: './pipeline-editor.component.html',
  styleUrls: ['./pipeline-editor.component.css']
})
export class PipelineEditorComponent implements AfterViewInit {

  @Input() devices: Device[];
  @Input() gateway: Gateway;
  @Input() gatewayId: string;
  @Input() pipeline: Pipeline;

  pipelineConfig = true;
  dataSourceConfig = false;
  filteringConfig = false;
  dataStoreConfig = false;
  dataPipeConfig = false;
  inferencingConfig = false;
  rulesConfig = false;
  streamingConfig = false;

  lastSelected = null;

  pipelineForm: FormGroup;
  protocolForm: FormGroup;
  dataStoreForm: FormGroup;
  filteringForm: FormGroup;
  streamingForm: FormGroup;

  @ViewChild("nodeEditor") el: ElementRef;
  editor = null;

  /**
   *
   */
  constructor(
    private formBuilder: FormBuilder) {

  }

  /**
   *
   */
  ngOnInit() {

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
      new ErrorHandlerComponent()
    ];

    const editor = new NodeEditor("demo@0.2.0", container);

    editor.use(ConnectionPlugin);
    console.log("AngularRenderPlugin", AngularRenderPlugin);
    editor.use(AngularRenderPlugin); //, { component: MyNodeComponent });
    editor.use(ContextMenuPlugin);

    const engine = new Engine("demo@0.2.0");

    components.map(c => {
      editor.register(c);
      engine.register(c);
    });

    editor.on(
      [
        "process",
        "nodecreated",
        "noderemoved",
        "connectioncreated",
        "connectionremoved"
      ],
      (async () => {
        console.log("Editor action executed");

        await engine.abort();
        await engine.process(editor.toJSON());
      }) as any
    );

    // editor.on(
    //   [
    //     "nodeselected"
    //   ],
    //   (async () => {
    //     console.log("Editor node selected");

    //   }) as any
    // );

    editor.on("nodeselected", node => {

      console.log("Editor node selected", node);

      console.log("Node data: ", node.data);

      if (this.lastSelected != null) {
        this.saveContext(this.lastSelected);
      }

      this.lastSelected = node;

      this.resetContext(node);

    });

    editor.on("click", (async () => {

      if (this.lastSelected != null) {

        // Remove visual selection
        editor.selected.remove(this.lastSelected);
        editor.trigger('nodeselected', this.lastSelected);

        this.saveContext(this.lastSelected);

        this.lastSelected = null;

        this.resetContext(null);
      }

    }) as any
    );

    editor.view.resize();
    editor.trigger("process");
    // zoomAt(editor);

  }

  saveContext(node) {

    let name = node.name;
    let contextObj = null;

    switch (name) {
      case "Data Source": {

        contextObj = this.buildProtocolProperties(this.protocolForm);
        break;
      }
      case "Data Store": {

        contextObj = this.buildDataStoreProperties(this.dataStoreForm);
        break;
      }
      case "Data Pipe": {

        contextObj = this.buildProtocolProperties(this.protocolForm);
        break;
      }
      case "Filters": {

        break;
      }
      default: {

        break;
      }
    }

    node.data["customdata"] = contextObj;

  }

  resetContext(node) {


    this.pipelineConfig = false;
    this.dataSourceConfig = false;
    this.filteringConfig = false;
    this.dataStoreConfig = false;
    this.dataPipeConfig = false;

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

  }

  /**
   *
   * @param form
   */
  buildProtocolProperties(form: FormGroup): any {
    let protocol = form.get('protocol').value;

    let protocolObj = null;

    if (protocol == "MQTT") {

      protocolObj = {
        "protocol": form.get(protocol.protocol),
        "protocolId": form.get(protocol.protocolId),
        "topic": form.get('mqtt.topic').value
      }

    }
    else if (protocol == "Kafka") {

      protocolObj = {
        "protocol": form.get(protocol.protocol),
        "prtocolId": form.get(protocol.protocolId),
        "topic": form.get('mqtt.topic').value
      }

    }

    return protocolObj;

  }

  /**
   *
   * @param form
   */
  buildDataStoreProperties(form: FormGroup): any {
    let dataStore = form.get('dataStore').value;

    let dataStoreObj = null;

    if (dataStore == "Postgres") {

      dataStoreObj = {
        "dataStore": form.get('dataStore').value,
        "dataStoreId": form.get('dataStoreId').value
      }
    }
    else if (dataStore == "Snowflake") {

      dataStoreObj = {
        "dataStore": form.get('dataStore').value,
        "dataStoreId": form.get('dataStoreId').value
      }
    }
    else if (dataStore == "TGDB") {

      dataStoreObj = {
        "dataStore": form.get('dataStore').value,
        "dataStoreId": form.get('dataStoreId').value
      }
    }
    else if (dataStore = "Dgraph") {

      dataStoreObj = {
        "dataStore": form.get('dataStore').value,
        "dataStoreId": form.get('dataStoreId').value
      }

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
      { "deviceNames": filters.toString() }
    ];

    return filterObj;
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
      let topic = context.topic;

      // Update protocol form
      console.log("Setting transportviewform protocol to: ", protocol);

      if (protocol == "MQTT") {

        this.protocolForm.patchValue({
          protocol: protocol,
          protocolId: protocolId,
          mqtt: {
            topic: topic
          }
        });

      }
      else if (protocol == "Kafka") {

        this.protocolForm.patchValue({
          protocol: protocol,
          protocolId: protocolId,
          kafka: {
            topic: topic
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

      if (dataStore == "Postgres") {

        this.dataStoreForm.patchValue({
          dataStoreId: dataStoreId,
          dataStore: dataStore,
        });

      }
      else if (dataStore == "Snowflake") {

        this.dataStoreForm.patchValue({
          dataStoreId: dataStoreId,
          dataStore: dataStore,
        });
      }

    }
  }

}
