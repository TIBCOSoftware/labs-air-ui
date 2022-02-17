import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { GraphService } from '../../services/graph/graph.service';
import { EdgeService } from '../../services/edge/edge.service';
import { FlogoDeployService } from '../../services/deployment/flogo-deploy.service';
import { Pipeline, Gateway, Device, Model } from '../../models/iot.model';

import { PipelineFilteringComponent } from './pipeline-filtering/pipeline-filtering.component';
import { PipelineInferencingComponent } from './pipeline-inferencing/pipeline-inferencing.component';
import { PipelineRestServiceComponent } from './pipeline-rest-service/pipeline-rest-service.component';
// Rete editor specific
import { NodeEditor, Engine } from 'rete';
import ConnectionPlugin from 'rete-connection-plugin';
import { AngularRenderPlugin } from 'rete-angular-render-plugin';
import ContextMenuPlugin from 'rete-context-menu-plugin';
// import { zoomAt } from "rete-area-plugin";

import { DataStoreComponent } from '../rete/components/data-store-component';
import { DataSubscriberComponent } from '../rete/components/data-subscriber-component';
import { FiltersComponent } from '../rete/components/filters-component';
import { DataPublisherComponent } from '../rete/components/data-publisher-component';
import { CustomPublisherComponent } from '../rete/components/custom-publisher-component';
import { ErrorHandlerComponent } from '../rete/components/error-handler-component';
import { ImageResizeComponent } from '../rete/components/image-resize-component';
import { InferencingComponent } from '../rete/components/inferencing-component';
import { RulesComponent } from '../rete/components/rules-component';
import { RuleExpressionComponent } from '../rete/components/rule-expression-component';
import { StreamingComponent } from '../rete/components/streaming-component';
import { NotificationPublisherComponent } from '../rete/components/notification-publisher-component';
import { FlogoFlowComponent } from '../rete/components/flogo-flow-component';
import { RestServiceComponent } from '../rete/components/rest-service-component';
import { NodePrimaryComponent } from '../rete/nodes/node-primary/node-primary.component';



@Component({
    selector: 'app-common-iot-pipeline',
    templateUrl: './iot-pipeline.component.html',
    styleUrls: ['./iot-pipeline.component.css']
})
export class CommonIotPipelineComponent implements OnInit, AfterViewInit {

  gatewayId = '';
  gateway = null as Gateway;
  devices: Device[] = [];
  models: Model[] = [];
  pipelineSelected = false;  // Used to control the display of buttons
  deployDisabled = true;
  undeployDisabled = true;
  dateFormat = 'yyyy-MM-dd  HH:mm:ss';
  translated = false;

  pipelinesDataSource = new MatTableDataSource<Pipeline>();
  pipelineDisplayedColumns: string[] = ['id', 'name', 'pipelineType', 'status', 'created', 'modified'];
  pipelineSelection = new SelectionModel<Pipeline>(false, []);

  pipelineConfig = true;
  dataSubscriberConfig = false;
  filteringConfig = false;
  dataStoreConfig = false;
  dataPublisherConfig = false;
  inferencingConfig = false;
  rulesConfig = false;
  ruleExpressionConfig = false;
  streamingConfig = false;
  flogoFlowConfig = false;
  restServiceConfig = false;
  xcor = 0;
  ycor = 0;

  lastNodeSelected = null;

  filters: any[] = [];

  pipelineForm: FormGroup;
  protocolForm: FormGroup;
  dataStoreForm: FormGroup;
  streamingForm: FormGroup;
  modelForm: FormGroup;
  ruleForm: FormGroup;
  ruleExpressionForm: FormGroup;
  flogoFlowForm: FormGroup;
  restServiceForm: FormGroup;
  dataOptionsForm: FormGroup;

  ruleTuplesDescriptor = [
      {
          'name': 'ReadingEvent',
          'ttl': 0,
          'properties': [
              {
                  'name': 'id',
                  'type': 'string',
                  'pk-index': 0
              },
              {
                  'name': 'gateway',
                  'type': 'String'
              },
              {
                  'name': 'device',
                  'type': 'String'
              },
              {
                  'name': 'resource',
                  'type': 'String'
              },
              {
                  'name': 'value',
                  'type': 'string'
              }
          ]
      },
      {
          'name': 'ResourceConcept',
          'ttl': -1,
          'properties': [
              {
                  'name': 'id',
                  'type': 'string',
                  'pk-index': 0
              },
              {
                  'name': 'device',
                  'type': 'String'
              },
              {
                  'name': 'resource',
                  'type': 'String'
              },
              {
                  'name': 'value',
                  'type': 'string'
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

  private restComponent: PipelineRestServiceComponent;
  @ViewChild('restComponent') set rcontent(content: PipelineRestServiceComponent) {
      if (content) { // initially setter gets called with undefined
          this.restComponent = content;
      }
  }

  @ViewChild('nodeEditor') el: ElementRef;
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

      console.log('PipelineEditor - ngAfterViewInit - devices: ', this.devices);

      const container = this.el.nativeElement;

      // new ImageResizeComponent();

      const components = [
          new DataSubscriberComponent(),
          new DataPublisherComponent(),
          new DataStoreComponent(),
          new FiltersComponent(),
          new InferencingComponent(),
          new RulesComponent(),
          new StreamingComponent(),
          new RuleExpressionComponent(),
          new RestServiceComponent(),
          new NotificationPublisherComponent(),
          new ImageResizeComponent(),
          new CustomPublisherComponent(),
          new FlogoFlowComponent(),
          new ErrorHandlerComponent()
      ];

      this.editor = new NodeEditor('demo@0.2.0', container);

      this.editor.use(ConnectionPlugin);
      console.log('AngularRenderPlugin', AngularRenderPlugin);
      this.editor.use(AngularRenderPlugin, { component: NodePrimaryComponent });
      this.editor.use(ContextMenuPlugin);

      const engine = new Engine('demo@0.2.0');

      components.map(c => {
          this.editor.register(c);
          engine.register(c);
      });

      this.editor.on(
          [
              'process',
              'connectioncreated',
              'nodecreated',
              'connectionremoved'

          ],
          (async () => {
              if (engine.silent) return;
              console.log('Editor action executed');
              await engine.abort();
              await engine.process(this.editor.toJSON());
          })
      );

      //Translate node to appear where the user right clicked
      this.editor.on(
          'contextmenu',
          ({ e }) => {
              this.translated = false;
              console.log('trasnlate', this.translated);
              this.xcor = e.clientX;
              this.ycor = e.clientY;

              // console.log(xcor,ycor);
              this.editor.on('nodecreated', node => {
                  console.log(this.translated);
                  //only transalted the current node if it has just been added
                  if (this.translated == false) {
                      console.log(this.xcor, this.ycor);
                      this.editor.view.nodes.get(node).translate(this.xcor + 100, this.ycor - 200);
                      this.translated = true;
                      // console.log(this.translated);
                  }
              });
          });

      // this.editor.trigger("process");
      this.editor.view.resize();

      // this.editor.on(
      //   [
      //     "nodeselected"
      //   ],
      //   (async () => {
      //     console.log("Editor node selected");

      //   }) as any
      // );


      // Handle node removed event
      this.editor.on('noderemove', node => {
          console.log('Editor node to remove', node);
          console.log('Editor node to remove', node.name);

          if (this.lastNodeSelected != null && this.lastNodeSelected == node) {
              console.log('Removing selected node.  Need to clean panel');

              // Clean shared variables
              this.clearFormsAndFilters();

              this.lastNodeSelected = null;

              this.resetNodeContext(null);

          }
      });

      // Handle node selected events
      this.editor.on('nodeselected', node => {

          console.log('Editor node selected', node);

          console.log('Node data: ', node.data);

          if (this.lastNodeSelected != null) {
              this.saveNodeContext(this.lastNodeSelected);

              // Clean shared variables
              this.clearFormsAndFilters();
          }

          this.lastNodeSelected = node;

          this.resetNodeContext(node);

      });


      this.editor.on('click', (async () => {

          console.log('Editor selected');

          if (this.lastNodeSelected != null) {

              this.saveNodeContext(this.lastNodeSelected);

              // Clean shared variables
              this.clearFormsAndFilters();

              // Remove visual selection
              // this.editor.selected.remove(this.lastNodeSelected);
              // this.editor.trigger('nodeselected', this.lastNodeSelected);

              this.editor.selected.clear();
              this.editor.nodes.map(n => n.update());

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

      this.editor.trigger('process');
      // zoomAt(this.editor);
      this.zoomAt(0.7);

  }

  zoomAt(k) {
      // const { area, container } = this.editor.view; // read from Vue component data;
      // const rect = area.el.getBoundingClientRect();
      // const ox = (rect.left - container.clientWidth / 2) * k;
      // const oy = (rect.top - container.clientHeight / 2) * k;

      // area.zoom(area.transform.k + k, ox, oy);

      const { area } = this.editor.view;

      area.zoom(k, 0, 0);
  }

  reorderFlow(flow: any): any {
      console.log('Reordering flow');
      const orderedFlow = [];

      function findStartFlowNode(): any {

          let node = null;

          const keys = Object.keys(flow.nodes);

          for (let i = 0; i < keys.length; i++) {
              console.log('This is key :', keys[i]);

              const currentNode = flow.nodes[keys[i]];
              const nodeInputKeys = Object.keys(currentNode.inputs);

              console.log('Inputs for current node: ', currentNode.inputs);
              console.log('Inputs keys for current node: ', nodeInputKeys);
              // if (currentNode.name == "Data Subscriber") {
              if (nodeInputKeys.length == 0) {
                  node = flow.nodes[keys[i]];
                  break;
              }
          }

          return node;
      }

      function findNextNodes(node: any): any {

          const nodeOutputKeys = Object.keys(node.outputs);

          if (nodeOutputKeys.length > 0) {
              const connections = node.outputs.event.connections;

              connections.forEach(connection => {
                  orderedFlow.push(flow.nodes[connection.node]);

                  findNextNodes(flow.nodes[connection.node]);
              });
          }

      }

      const startFlowNode = findStartFlowNode();

      orderedFlow.push(startFlowNode);

      console.log('Ordered flow after getting start: ', orderedFlow);


      findNextNodes(startFlowNode);

      console.log('Ordered flow after getting next: ', orderedFlow);

      return orderedFlow;

  }

  saveNodeContext(node) {

      const name = node.name;
      let contextObj = null;

      switch (name) {
      case 'Data Subscriber': {

          contextObj = this.buildNodeProtocolProperties(this.protocolForm, null);
          break;
      }
      case 'Data Store': {

          contextObj = this.buildNodeDataStoreProperties(this.dataStoreForm, this.dataOptionsForm);
          break;
      }
      case 'Data Publisher': {

          contextObj = this.buildNodeProtocolProperties(this.protocolForm, this.dataOptionsForm);
          break;
      }
      case 'Custom Publisher': {

          contextObj = this.buildNodeProtocolProperties(this.protocolForm, this.dataOptionsForm);
          break;
      }
      case 'Notification Publisher': {

          contextObj = this.buildNodeProtocolProperties(this.protocolForm, this.dataOptionsForm);
          break;
      }
      case 'Filters': {
          contextObj = this.buildNodeDataFilteringProperties();
          break;
      }
      case 'Inferencing': {
          contextObj = this.buildNodeDataInferencingProperties();
          break;
      }
      case 'Streaming': {
          contextObj = this.buildNodeDataStreamingProperties();
          break;
      }
      case 'Rules': {
          contextObj = this.buildNodeRuleProperties();
          break;
      }
      case 'Rule Expression': {
          contextObj = this.buildNodeRuleExpressionProperties();
          break;
      }
      case 'Flogo Flow': {
          contextObj = this.buildNodeFlogoFlowProperties();
          break;
      }
      case 'REST Service': {
          contextObj = this.buildNodeDataRESTServiceProperties();
          break;
      }
      default: {

          break;
      }
      }

      node.data['customdata'] = contextObj;

  }

  resetNodeContext(node) {

      this.pipelineConfig = false;
      this.dataSubscriberConfig = false;
      this.filteringConfig = false;
      this.dataStoreConfig = false;
      this.dataPublisherConfig = false;
      this.inferencingConfig = false;
      this.rulesConfig = false;
      this.ruleExpressionConfig = false;
      this.streamingConfig = false;
      this.flogoFlowConfig = false;
      this.restServiceConfig = false;

      if (node != null || node != undefined) {
          console.log('Resetting context for node: ', node);
          console.log('Resetting context for node name: ', node.name);

          const contextObj = node.data['customdata'];

          switch (node.name) {
          case 'Data Subscriber': {
              this.updateProtocolForm(contextObj);
              this.dataSubscriberConfig = true;
              break;
          }
          case 'Data Store': {
              this.updateDataStoreForm(contextObj);
              this.updateDataOptionsForm(contextObj);
              this.dataStoreConfig = true;
              break;
          }
          case 'Data Publisher': {
              this.updateProtocolForm(contextObj);
              this.updateDataOptionsForm(contextObj);
              this.dataPublisherConfig = true;
              break;
          }
          case 'Custom Publisher': {
              this.updateProtocolForm(contextObj);
              this.updateDataOptionsForm(contextObj);
              this.dataPublisherConfig = true;
              break;
          }
          case 'Notification Publisher': {
              this.updateProtocolForm(contextObj);
              this.updateDataOptionsForm(contextObj);
              this.dataPublisherConfig = true;
              break;
          }
          case 'Filters': {
              this.filteringConfig = true;
              this.updateFiltersComponent(contextObj);
              break;
          }
          case 'Inferencing': {
              this.updateInferencingComponent(contextObj);
              this.inferencingConfig = true;
              break;
          }
          case 'Streaming': {
              this.updateStreamingComponent(contextObj);
              this.streamingConfig = true;
              break;
          }
          case 'Rules': {
              this.updateRulesComponent(contextObj);
              this.rulesConfig = true;
              break;
          }
          case 'Rule Expression': {
              this.updateRuleExpressionComponent(contextObj);
              this.ruleExpressionConfig = true;
              break;
          }
          case 'Flogo Flow': {
              this.updateFlogoFlowComponent(contextObj);
              this.flogoFlowConfig = true;
              break;
          }
          case 'REST Service': {
              this.updateRESTServiceComponent(contextObj);
              this.restServiceConfig = true;
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
          inputTemplate: '',
          logLevel: 'INFO',
      }, { emitEvent: false });

      this.restServiceForm.reset({
          description: '',
          url: '',
          logLevel: 'INFO',
      }, { emitEvent: false });

      this.protocolForm.patchValue({
          protocolId: '',
          protocol: '',
          logLevel: 'INFO',
      }, { emitEvent: true });


      this.dataOptionsForm.patchValue({
          useReading: true,
          encodeReadingValue: false,
          useEnrichedReading: false,
          encodeEnrichedReadingValue: false,
      }, { emitEvent: true });

      // clear flogo app form
      this.flogoFlowForm.patchValue({
          flowFilename: '',
          flowDefinition: '',
          flowProperties: '',
          volumeName: '',
          volumePath: '',
          portMap1: '8080:9999',
          portMap2: '',
          httpServicePort: '',
          propsEnv: 'auto',
      }, { emitEvent: false });

  }


  /**
   * Create forms to add pipelines as well as form to view pipeline information
   */
  createForms() {

      this.pipelineForm = this.formBuilder.group({
          uid: ['', Validators.required],
          name: ['', Validators.required],
          pipelineType: ['', Validators.required],
          deployerType: ['', Validators.required],
          description: ['', Validators.required],
          created: ['', Validators.required],
          modified: ['', Validators.required],
          status: ['', Validators.required],
          flowConfiguration: ['', Validators.required],
          logLevel: ['INFO', Validators.required]
      });

      this.dataOptionsForm = this.formBuilder.group({
          useReading: [true],
          encodeReadingValue: [false],
          useEnrichedReading: [false],
          encodeEnrichedReadingValue: [false]
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
          inputTemplate: ['', Validators.required],
          logLevel: ['INFO', Validators.required]
      });

      this.restServiceForm = this.formBuilder.group({
          description: ['', Validators.required],
          url: ['', Validators.required],
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

      this.ruleExpressionForm = this.formBuilder.group({
          name: ['', Validators.required],
          description: [''],
          device: ['', Validators.required],
          resource: ['', Validators.required],
          compareOp: ['', Validators.required],
          compareToValue: ['', Validators.required],
          notification: ['', Validators.required],
          notificationLevel: ['INFO', Validators.required],
          logLevel: ['INFO', Validators.required]
      });

      this.flogoFlowForm = this.formBuilder.group({
          flowFilename: ['', Validators.required],
          flowDefinition: ['', Validators.required],
          flowProperties: ['', Validators.required],
          volumeName: [''],
          volumePath: [''],
          portMap1: ['8080:9999'],
          portMap2: [''],
          httpServicePort: [''],
          propsEnv: ['auto']
      });

  }

  /**
   *
   * @param protocolForm
   * @param dataOptionsForm
   */
  buildNodeProtocolProperties(protocolForm: FormGroup, dataOptionsForm: FormGroup): any {
      const protocol = protocolForm.get('protocol').value;
      let useReading = true;
      let encodeReadingValue = false;
      let useEnrichedReading = false;
      let encodeEnrichedReadingValue = false;

      if (dataOptionsForm != null) {
          useReading = dataOptionsForm.get('useReading').value;
          encodeReadingValue = dataOptionsForm.get('encodeReadingValue').value;
          useEnrichedReading = dataOptionsForm.get('useEnrichedReading').value;
          encodeEnrichedReadingValue = dataOptionsForm.get('encodeEnrichedReadingValue').value;
      }

      let protocolObj = null;

      if (protocol == 'MQTT') {

          protocolObj = {
              'useReading': useReading,
              'encodeReadingValue': encodeReadingValue,
              'useEnrichedReading': useEnrichedReading,
              'encodeEnrichedReadingValue': encodeEnrichedReadingValue,
              'protocol': protocolForm.get('protocol').value,
              'protocolId': protocolForm.get('protocolId').value,
              'logLevel': protocolForm.get('logLevel').value,
              'hostname': protocolForm.get('mqtt.hostname').value,
              'port': protocolForm.get('mqtt.port').value,
              'username': protocolForm.get('mqtt.username').value,
              'password': protocolForm.get('mqtt.password').value,
              'encriptionMode': protocolForm.get('mqtt.encryptionMode').value,
              'caCertificate': protocolForm.get('mqtt.caCertificate').value,
              'clientCertificate': protocolForm.get('mqtt.clientCertificate').value,
              'clientKey': protocolForm.get('mqtt.clientKey').value,
              'topic': protocolForm.get('mqtt.topic').value,
              'maximumQOS': protocolForm.get('mqtt.maximumQOS').value,
          };

      }
      else if (protocol == 'Kafka') {

          protocolObj = {
              'useReading': useReading,
              'encodeReadingValue': encodeReadingValue,
              'useEnrichedReading': useEnrichedReading,
              'encodeEnrichedReadingValue': encodeEnrichedReadingValue,
              'protocol': protocolForm.get('protocol').value,
              'protocolId': protocolForm.get('protocolId').value,
              'logLevel': protocolForm.get('logLevel').value,
              'hostname': protocolForm.get('kafka.hostname').value,
              'port': protocolForm.get('kafka.port').value,
              'authMode': protocolForm.get('kafka.authMode').value,
              'username': protocolForm.get('kafka.username').value,
              'password': protocolForm.get('kafka.password').value,
              'clientCertificate': protocolForm.get('kafka.clientCertificate').value,
              'clientKey': protocolForm.get('kafka.clientKey').value,
              'serverCertificate': protocolForm.get('kafka.serverCertificate').value,
              'connectionTimeout': protocolForm.get('kafka.connectionTimeout').value,
              'retryBackoff': protocolForm.get('kafka.retryBackoff').value,
              'topic': protocolForm.get('kafka.topic').value,
              'consumerGroupId': protocolForm.get('kafka.consumerGroupId').value,
              'commitInterval': protocolForm.get('kafka.commitInterval').value,
              'initialOffset': protocolForm.get('kafka.initialOffset').value,
              'fetchMinBytes': protocolForm.get('kafka.fetchMinBytes').value,
              'fetchMaxWait': protocolForm.get('kafka.fetchMaxWait').value,
              'heartbeatInterval': protocolForm.get('kafka.heartbeatInterval').value,
              'sessionTimeout': protocolForm.get('kafka.sessionTimeout').value,
          };

      }
      else if (protocol == 'AMQP') {

          protocolObj = {
              'useReading': useReading,
              'encodeReadingValue': encodeReadingValue,
              'useEnrichedReading': useEnrichedReading,
              'encodeEnrichedReadingValue': encodeEnrichedReadingValue,
              'protocol': protocolForm.get('protocol').value,
              'protocolId': protocolForm.get('protocolId').value,
              'logLevel': protocolForm.get('logLevel').value,
              'hostname': protocolForm.get('amqp.hostname').value,
              'port': protocolForm.get('amqp.port').value,
              'username': protocolForm.get('amqp.username').value,
              'password': protocolForm.get('amqp.password').value,
              'exchangeName': protocolForm.get('amqp.exchangeName').value,
              'exchangeType': protocolForm.get('amqp.exchangeType').value,
              'routingKey': protocolForm.get('amqp.routingKey').value,
              'reliable': protocolForm.get('amqp.reliable').value
          };

      }


      return protocolObj;

  }

  /**
   *
   * @param form
   */
  buildNodeDataStoreProperties(form: FormGroup, dataOptionsForm: FormGroup): any {
      let dataStore = form.get('dataStore').value;
      let useReading = true;
      let useEnrichedReading = true;

      if (dataOptionsForm != null) {
          useReading = dataOptionsForm.get('useReading').value;
          useEnrichedReading = dataOptionsForm.get('useEnrichedReading').value;
      }
      let dataStoreObj = null;

      if (dataStore == 'PostgreSQL2') {

          dataStoreObj = {
              'useReading': useReading,
              'useEnrichedReading': useEnrichedReading,
              'dataStore': form.get('dataStore').value,
              'dataStoreId': form.get('dataStoreId').value,
              'logLevel': form.get('logLevel').value,
              'host': form.get('postgres.host').value,
              'port': form.get('postgres.port').value,
              'databaseName': form.get('postgres.databaseName').value,
              'user': form.get('postgres.user').value,
              'password': form.get('postgres.password').value,
          };
      }
      else if (dataStore == 'Snowflake') {

          dataStoreObj = {
              'useReading': useReading,
              'useEnrichedReading': useEnrichedReading,
              'dataStore': form.get('dataStore').value,
              'dataStoreId': form.get('dataStoreId').value,
              'logLevel': form.get('logLevel').value,
              'accountName': form.get('snowflake.accountName').value,
              'warehouse': form.get('snowflake.warehouse').value,
              'database': form.get('snowflake.database').value,
              'schema': form.get('snowflake.schema').value,
              'authType': form.get('snowflake.authType').value,
              'username': form.get('snowflake.username').value,
              'password': form.get('snowflake.password').value,
              'role': form.get('snowflake.role').value,
              'clientId': form.get('snowflake.clientId').value,
              'clientSecret': form.get('snowflake.clientSecret').value,
              'authorizationCode': form.get('snowflake.authorizationCode').value,
              'redirectURI': form.get('snowflake.redirectURI').value,
              'loginTimeout': form.get('snowflake.loginTimeout').value,
          };
      }
      else if (dataStore == 'TGDB') {

          dataStoreObj = {
              'useReading': useReading,
              'useEnrichedReading': useEnrichedReading,
              'dataStore': form.get('dataStore').value,
              'dataStoreId': form.get('dataStoreId').value,
              'logLevel': form.get('logLevel').value,
              'url': form.get('tgdb.url').value,
              'username': form.get('tgdb.username').value,
              'password': form.get('tgdb.password').value,
          };
      }
      else if (dataStore = 'Dgraph') {

          dataStoreObj = {
              'useReading': useReading,
              'useEnrichedReading': useEnrichedReading,
              'dataStore': form.get('dataStore').value,
              'dataStoreId': form.get('dataStoreId').value,
              'logLevel': form.get('logLevel').value,
              'url': form.get('dgraph.url').value,
              'username': form.get('dgraph.username').value,
              'password': form.get('dgraph.password').value,
          };

      }

      return dataStoreObj;
  }

  /**
   *
   * @param form
   */
  buildNodeDataFilteringProperties(): any {

      const filterObj = {
          'filters': this.filterComponent.getFilters()
      };

      console.log('iot-pipeline_buildNodeDataFilteringProperties: filters:', filterObj);


      return filterObj;
  }

  /**
   *
   * @param form
   */
  buildNodeDataInferencingProperties(): any {

      const inferenceObj = {
          'modelName': this.modelForm.get('name').value,
          'modelDescription': this.modelForm.get('description').value,
          'modelUrl': this.modelForm.get('url').value,
          'filters': this.inferenceComponent.getFilters(),
          'inputTemplate': this.modelForm.get('inputTemplate').value,
          'logLevel': this.modelForm.get('logLevel').value,
      };

      return inferenceObj;
  }

  /**
   *
   * @param form
   */
  buildNodeDataStreamingProperties(): any {

      const streamingObj = {
          'deviceName': this.streamingForm.get('deviceName').value,
          'instrumentName': this.streamingForm.get('instrumentName').value,
          'function': this.streamingForm.get('function').value,
          'windowType': this.streamingForm.get('windowType').value,
          'windowSize': this.streamingForm.get('windowSize').value,
          'logLevel': this.streamingForm.get('logLevel').value
      };

      return streamingObj;
  }

  /**
   *
   * @param form
   */
  buildNodeRuleProperties(): any {

      const ruleObj = {
          'name': this.ruleForm.get('name').value,
          'description': this.ruleForm.get('description').value,
          'condDevice': this.ruleForm.get('condDevice').value,
          'condResource': this.ruleForm.get('condResource').value,
          'condCompareNewMetricToValue': this.ruleForm.get('condCompareNewMetricToValue').value,
          'condCompareNewMetricToValueOp': this.ruleForm.get('condCompareNewMetricToValueOp').value,
          'condCompareNewMetricValue': this.ruleForm.get('condCompareNewMetricValue').value,
          'condCompareNewMetricToLastMetric': this.ruleForm.get('condCompareNewMetricToLastMetric').value,
          'condCompareNewMetricToLastMetricOp': this.ruleForm.get('condCompareNewMetricToLastMetricOp').value,
          'condCompareLastMetricToValue': this.ruleForm.get('condCompareLastMetricToValue').value,
          'condCompareLastMetricToValueOp': this.ruleForm.get('condCompareLastMetricToValueOp').value,
          'condCompareLastMetricValue': this.ruleForm.get('condCompareLastMetricValue').value,
          'actionSendNotification': this.ruleForm.get('actionSendNotification').value,
          'actionNotification': this.ruleForm.get('actionNotification').value,
          'actionSendCommand': this.ruleForm.get('actionSendCommand').value,
          'actionDevice': this.ruleForm.get('actionDevice').value,
          'actionResource': this.ruleForm.get('actionResource').value,
          'actionValue': this.ruleForm.get('actionValue').value,
          'logLevel': this.ruleForm.get('logLevel').value
      };

      console.log('Rule context saved: ', ruleObj);

      return ruleObj;
  }

  /**
   *
   * @param form
   */
  buildNodeRuleExpressionProperties(): any {

      const ruleObj = {
          'name': this.ruleExpressionForm.get('name').value,
          'description': this.ruleExpressionForm.get('description').value,
          'device': this.ruleExpressionForm.get('device').value,
          'resource': this.ruleExpressionForm.get('resource').value,
          'compareOp': this.ruleExpressionForm.get('compareOp').value,
          'compareToValue': this.ruleExpressionForm.get('compareToValue').value,
          'notification': this.ruleExpressionForm.get('notification').value,
          'notificationLevel': this.ruleExpressionForm.get('notificationLevel').value,
          'logLevel': this.ruleExpressionForm.get('logLevel').value
      };

      console.log('Rule Expression context saved: ', ruleObj);

      return ruleObj;
  }

  /**
   *
   * @param form
   */
  buildNodeFlogoFlowProperties(): any {

      const flogoFlowObj = {
          'flowFilename': this.flogoFlowForm.get('flowFilename').value,
          'flowDefinition': this.flogoFlowForm.get('flowDefinition').value,
          'flowProperties': this.flogoFlowForm.get('flowProperties').value,
          'volumeName': this.flogoFlowForm.get('volumeName').value,
          'volumePath': this.flogoFlowForm.get('volumePath').value,
          'portMap1': this.flogoFlowForm.get('portMap1').value,
          'portMap2': this.flogoFlowForm.get('portMap2').value,
          'httpServicePort': this.flogoFlowForm.get('httpServicePort').value,
          'propsEnv': this.flogoFlowForm.get('propsEnv').value
      };

      console.log('FlogoFlow context saved: ', flogoFlowObj);

      return flogoFlowObj;
  }

  /**
   *
   * @param form
   */
  buildNodeDataRESTServiceProperties(): any {

      const restServiceObj = {
          'description': this.restServiceForm.get('description').value,
          'url': this.restServiceForm.get('url').value,
          'filters': this.restComponent.getFilters(),
          'logLevel': this.restServiceForm.get('logLevel').value
      };

      console.log('REST Service context saved: ', restServiceObj);

      return restServiceObj;
  }

  /**
   *
   * @param context
   */
  updateDataOptionsForm(context) {
      if (context != null || context != undefined) {
          this.dataOptionsForm.patchValue({
              useReading: context.useReading,
              encodeReadingValue: context.encodeReadingValue,
              useEnrichedReading: context.useEnrichedReading,
              encodeEnrichedReadingValue: context.encodeEnrichedReadingValue
          });
      }
  }

  /**
   *
   * @param context
   */
  updateProtocolForm(context) {

      if (context != null || context != undefined) {
          console.log('Updating protocolform with context: ', context);

          const protocolId = context.protocolId;
          const protocol = context.protocol;

          // Update protocol form
          console.log('Setting transportviewform protocol to: ', protocol);

          if (protocol == 'MQTT') {

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
          else if (protocol == 'Kafka') {

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
          else if (protocol == 'AMQP') {

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
          console.log('Updating dataStoreform with context: ', context);

          const dataStoreId = context.dataStoreId;
          const dataStore = context.dataStore;

          // Update datastore form
          console.log('Setting datastore form datastore to: ', dataStore);

          if (dataStore == 'PostgreSQL2') {

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
          else if (dataStore == 'Snowflake') {

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
          else if (dataStore == 'TGDB') {

              this.dataStoreForm.patchValue({
                  dataStoreId: dataStoreId,
                  dataStore: dataStore,
                  logLevel: context.logLevel,
                  tgdb: {
                      url: context.url,
                      username: context.username,
                      password: context.password
                  }
              });
          }
          else if (dataStore == 'Dgraph') {

              this.dataStoreForm.patchValue({
                  dataStoreId: dataStoreId,
                  dataStore: dataStore,
                  logLevel: context.logLevel,
                  dgraph: {
                      url: context.url,
                      username: context.username,
                      password: context.password
                  }
              });
          }

      }
  }

  /**
   *
   * @param context
   */
  updateFiltersComponent(context) {

      if (context != null || context != undefined) {
          console.log('Updating filter component with context: ', context);

          this.filters = context.filters;
      }
  }

  /**
   *
   * @param context
   */
  updateInferencingComponent(context) {

      if (context != null || context != undefined) {
          console.log('Updating inferencing component with context: ', context);

          this.filters = context.filters;

          this.modelForm.patchValue({
              name: context.modelName,
              description: context.modelDescription,
              url: context.modelUrl,
              inputTemplate: context.inputTemplate,
              LogLevel: context.logLevel
          });

      }
  }

  /**
   *
   * @param context
   */
  updateStreamingComponent(context) {

      if (context != null || context != undefined) {
          console.log('Updating streaming component with context: ', context);

          this.streamingForm.patchValue({
              deviceName: context.deviceName,
              instrumentName: context.instrumentName,
              function: context.function,
              windowType: context.windowType,
              windowSize: context.windowSize,
              logLevel: context.logLevel,
          });

      }
  }

  /**
   *
   * @param context
   */
  updateRulesComponent(context) {

      if (context != null || context != undefined) {
          console.log('Updating rules component with context: ', context);

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
          });

      }
  }

  /**
   *
   * @param context
   */
  updateRuleExpressionComponent(context) {

      if (context != null || context != undefined) {
          console.log('Updating rules component with context: ', context);

          this.ruleExpressionForm.patchValue({
              name: context.name,
              description: context.description,
              device: context.device,
              resource: context.resource,
              compareOp: context.compareOp,
              compareToValue: context.compareToValue,
              notification: context.notification,
              notificationLevel: context.notificationLevel,
              logLevel: context.logLevel,
          });

      }
  }
  /**
 * @param context
 */
  updateFlogoFlowComponent(context) {

      if (context != null || context != undefined) {
          console.log('Updating flogo flow component with context: ', context);

          this.flogoFlowForm.patchValue({
              flowFilename: context.flowFilename,
              flowDefinition: context.flowDefinition,
              flowProperties: context.flowProperties,
              volumeName: context.volumeName,
              volumePath: context.volumePath,
              portMap1: context.portMap1,
              portMap2: context.portMap2,
              httpServicePort: context.httpServicePort,
              propsEnv: context.propsEnv,
          });

      }
  }

  /**
*
* @param context
*/
  updateRESTServiceComponent(context) {

      if (context != null || context != undefined) {
          console.log('Updating rest service component with context: ', context);

          this.filters = context.filters;

          this.restServiceForm.patchValue({
              description: context.description,
              url: context.url,
              logLevel: context.logLevel,
          });

      }
  }


  /**
   * Get Gateway, Pipelines and Devices information
   */
  public getGatewayAndPipelines(gatewayId: string, selectedPipeline: Pipeline, updateEditor: boolean) {
      console.log('Getting gateway and pipelines for: ', gatewayId);

      this.graphService.getGatewayAndPipelines(gatewayId)
          .subscribe(res => {
              console.log('Received response for graphService.getGatewayAndPipelines: ', res);
              this.gateway = res[0] as Gateway;

              if (res[0].pipelines != undefined) {

                  console.log('Setting pipelineDataSource.data fo incoming pipeline');


                  this.pipelinesDataSource.data = res[0].pipelines as Pipeline[];

                  // Select last selectedPipeline
                  if (selectedPipeline != null) {
                      for (let i = 0; i < this.pipelinesDataSource.data.length; i++) {
                          if (this.pipelinesDataSource.data[i].name == selectedPipeline.name) {
                              this.onPipelineClicked(this.pipelinesDataSource.data[i], updateEditor);
                          }
                      }
                  }

              }
              else {

                  this.pipelinesDataSource = new MatTableDataSource<Pipeline>();

                  console.log('Setting pipelineDataSource.data to null');
              }

          });
  }

  /**
   * Get Gateway, Pipelines and Devices information
   */
  public getGatewayDetails(gatewayId: string) {
      console.log('Getting gateway and pipelines for: ', gatewayId);

      this.graphService.getGatewayAndPipelines(gatewayId)
          .subscribe(res => {
              console.log('Received response for graphService.getGatewayAndPipelines: ', res);
              this.gateway = res[0] as Gateway;

              if (res[0].pipelines != undefined) {

                  console.log('Setting pipelineDataSource.data fo incoming pipeline');

                  this.pipelinesDataSource.data = res[0].pipelines as Pipeline[];

                  console.log('Got Pipelines on pilpelinesDataSource.data: ' + this.pipelinesDataSource.data.toString());
              }
              else {

                  this.pipelinesDataSource = new MatTableDataSource<Pipeline>();

                  console.log('Setting pipelineDataSource.data to null');
              }

              // Get Devices to be used for filtering
              this.getDevices(this.gateway);

              // Get Models to be used for inferencing
              this.getModels(gatewayId);

          });
  }

  /**
   * Get Devices for a geteway
   * @param gateway
   */
  getDevices(gateway: Gateway) {
      console.log('Get devices for: ', gateway);

      try {
          const decodedData = atob(gateway.devicesMetadata);
          const jsonData = JSON.parse(decodedData);
          this.devices = jsonData as Device[];
      } catch (error) {
          console.log('Could not parse the gateway', gateway);
      }

      console.log('Devices: ', this.devices);
  }

  /**
   * Get Devices for a geteway - Not used anymore as now devices metadata is included in gateway
   * @param gateway
   */
  getDevicesExternal(gateway: Gateway) {
      console.log('Calling EdgeService to get devices for: ', gateway);

      this.edgeService.getDevices(gateway)
          .subscribe(res => {
              this.devices = res as Device[];

              console.log('Got devices: ', this.devices);

          });
  }

  /**
   * Get Models for a geteway
   * @param gateway
   */
  getModels(gatewayId) {
      console.log('Calling GraphService to get models for: ', gatewayId);

      this.graphService.getModels(gatewayId)
          .subscribe(res => {
              this.models = res as Model[];

              console.log('Got models: ', this.models);

          });
  }

  /**
   * Handles selection of pipeline on table
   */
  onPipelineClicked(row, updateEditor: boolean) {

      console.log('Row clicked: ', row);
      let currentPipelineSelected = null;

      console.log('On pipeline clicked - row clicked  selected: ', this.pipelineSelection.isSelected(row));



      if (this.pipelineSelection.hasValue()) {
          console.log('pipelineSelection has value');

          if (this.pipelineSelection.selected[0].uid == row.uid &&
        this.pipelineSelection.selected[0] != row) {

              this.pipelineSelection.select(row);
              this.pipelineSelected = true;

          }

          currentPipelineSelected = this.pipelineSelection.selected[0];
      }

      // Skip if same row is selected
      if (currentPipelineSelected == null || currentPipelineSelected.uid != row.uid) {
          console.log('Not Skipping as same row is not selected row uid', row.uid);



          // Clear previous selection and editor
          if (currentPipelineSelected != null) {
              console.log('Not Skipping as same row is not selected currentselection uid', currentPipelineSelected.uid);
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
              deployerType: row.deployerType,
              description: row.description,
              status: row.status,
              flowConfiguration: row.flowConfiguration,
              logLevel: row.logLevel
          }, { emitEvent: false });

          if (updateEditor) {
              // Reset the editor
              const decodedData = decodeURIComponent(row.flowConfiguration);
              const jsonData = JSON.parse(decodedData);
              this.editor.fromJSON(jsonData);
          }

          // Reset command buttons
          console.log('Resetting buttons for status: ', row.status);

          if (row.status == 'Saved') {
              this.deployDisabled = false;
              this.undeployDisabled = true;

          }
          else if (row.status == 'Deployed') {
              this.deployDisabled = true;
              this.undeployDisabled = false;
          }
          else {
              this.deployDisabled = true;
              this.undeployDisabled = true;
          }

      }
      else {
          console.log('skipping as same row is selected');

      }


  }

  newPipeline() {
      console.log('Deleting pipeline: ', this.pipelineForm);

      if (this.pipelineSelection.hasValue()) {

          this.pipelineSelected = false;

          const pipeline = this.pipelineSelection.selected[0];

          this.pipelineSelection.clear();

          this.clearPipeline();
      }
  }

  savePipelineToGraph() {
      const editorData = this.editor.toJSON();

      const pipelineName = this.pipelineForm.get('name').value;
      const pipelineId = this.pipelineForm.get('uid').value;
      const pipelineType = this.pipelineForm.get('pipelineType').value;
      const deployerType = this.pipelineForm.get('deployerType').value;
      if (pipelineName == '' || pipelineType == '') {
          this._snackBar.open('Failure', 'Pipeline needs a name and type', {
              duration: 3000,
          });
      }
      else if (pipelineId != '') {
          this.updatePipelineToGraph(true);
      }
      else {
          console.log('Saved editor data: ', editorData);

          // Save pipeline
          const pipeline = new Pipeline();
          const tsms = Date.now();
          pipeline.created = tsms;
          pipeline.modified = tsms;
          pipeline.name = this.pipelineForm.get('name').value;
          pipeline.pipelineType = this.pipelineForm.get('pipelineType').value;
          pipeline.deployerType = this.pipelineForm.get('deployerType').value;
          pipeline.description = this.pipelineForm.get('description').value;
          pipeline.status = 'Saved';
          pipeline.flowConfiguration = encodeURIComponent(JSON.stringify(editorData));
          pipeline.logLevel = this.pipelineForm.get('logLevel').value;

          // Add pipeline to graph
          this.graphService.addPipeline(this.gateway.uid, pipeline, '', '', null, null)
              .subscribe(res => {
                  console.log('Added pipeline: ', res);

                  this.getGatewayAndPipelines(this.gatewayId, pipeline, false);

                  let message = 'Success';
                  if (res == undefined) {
                      message = 'Failure';
                  }

                  this._snackBar.open(message, 'Save Pipeline', {
                      duration: 3000,
                  });

              });
      }

  }

  updatePipelineToGraph(showSnackbar: boolean) {

      const editorData = this.editor.toJSON();

      // Update pipeline
      const pipeline = new Pipeline();
      const tsms = Date.now();
      pipeline.modified = tsms;
      pipeline.name = this.pipelineForm.get('name').value;
      pipeline.uid = this.pipelineForm.get('uid').value;
      pipeline.pipelineType = this.pipelineForm.get('pipelineType').value;
      pipeline.deployerType = this.pipelineForm.get('deployerType').value;
      pipeline.description = this.pipelineForm.get('description').value;
      pipeline.status = this.pipelineForm.get('status').value;
      pipeline.flowConfiguration = encodeURIComponent(JSON.stringify(editorData));
      pipeline.logLevel = this.pipelineForm.get('logLevel').value;

      // Add pipeline to graph
      this.graphService.updatePipeline(pipeline)
          .subscribe(res => {
              console.log('Updated pipeline: ', res);

              this.getGatewayAndPipelines(this.gatewayId, pipeline, false);

              if (showSnackbar) {
                  let message = 'Success';
                  if (res == undefined) {
                      message = 'Failure';
                  }

                  this._snackBar.open(message, 'Update Pipeline', {
                      duration: 3000,
                  });
              }

          });

  }


  /**
     * deletePipelineFromGraph
     */
  deletePipelineFromGraph() {
      console.log('Deleting pipeline: ', this.pipelineForm);

      if (this.pipelineSelection.hasValue()) {

          this.pipelineSelected = false;
          this.deployDisabled = true;
          this.undeployDisabled = true;

          const pipeline = this.pipelineSelection.selected[0];

          // if (pipeline.status != "Undeployed") {
          //   this.undeploySelectedDataPipeline();
          // }
          this.pipelineSelection.clear();

          this.graphService.deletePipeline(this.gateway.uid, pipeline)
              .subscribe(res => {
                  console.log('Result from delete pipeline', res);

                  this.getGatewayAndPipelines(this.gatewayId, null, true);

                  // Clear the editor
                  this.clearPipeline();

                  // this.resetPipelineForm();
              });
      }
      else {
          console.log('No selection to delete');

      }
  }


  clearPipeline() {
      // var nodeInstance = this.editor.nodes[0];

      // this.editor.removeNode(nodeInstance)

      this.editor.clear();

      this.pipelineConfig = true;
      this.dataSubscriberConfig = false;
      this.filteringConfig = false;
      this.dataStoreConfig = false;
      this.dataPublisherConfig = false;
      this.inferencingConfig = false;
      this.rulesConfig = false;
      this.ruleExpressionConfig = false;
      this.streamingConfig = false;
      this.flogoFlowConfig = false;
      this.restServiceConfig = false;

      this.pipelineForm.patchValue({
          uid: '',
          name: '',
          pipelineType: '',
          deployerType: '',
          description: '',
          status: '',
          logLevel: 'INFO'
      });

  }

  printPipeline() {
      const flowData = this.editor.toJSON();

      console.log('Editor Flow Data: ', flowData);

      const orderedFlow = this.reorderFlow(flowData);

      console.log('Ordered pipeline flow: ', orderedFlow);
  }

  buildPipelineRequest(pipelineId: string): any {

      const deployType = this.pipelineForm.get('pipelineType').value;
      const deployerType = this.pipelineForm.get('deployerType').value;
      const appLogLevel = this.pipelineForm.get('logLevel').value;
      let serviceType = 'docker';
      let image = '';
      let systemEnv = {};
      let extra = [];

      console.log('Building pipeline request for gateway: ', this.gateway);

      let deployNetwork = {};
      if (this.gateway.deployNetwork == 'snap') {
          deployNetwork = {
              'Name': 'services.$Name$.network_mode',
              'Value': 'host'
          };
      }
      else {
          deployNetwork = {
              'Name': 'networks.default.external.name',
              'Value': this.gateway.deployNetwork
          };
      }

      if (deployType == 'Edge') {

          console.log('Building request for Edge');


          if (deployerType == 'OH') {
              console.log('Building for OH');

              systemEnv = {
                  'Platform': this.gateway.platform,
                  'DetachedMode': 'n',
                  'Username': this.gateway.username,
                  'TargetServer': this.gateway.router,
                  'Port': this.gateway.routerPort,
                  'DeployConstrains': '["role == RTSF_Demo"]',
                  'ServiceProperties': '{}'
              };
          }
          else {
              systemEnv = {
                  'Platform': this.gateway.platform,
                  'DetachedMode': 'n',
                  'Username': this.gateway.username,
                  'TargetServer': this.gateway.router,
                  'Port': this.gateway.routerPort
              };
          }


          extra = [
              { 'Name': 'App.LogLevel', 'Value': appLogLevel },
              deployNetwork
          ];
      }

      if (deployerType == 'OH') {
          serviceType = 'docker-oh';
          image = 'bigoyang/' + pipelineId + ':0.1.1';
      }

      let pipelineFlow = {
          'ComponentType': 'Service',
          'ServiceType': serviceType,
          'Image': image,
          'AirDescriptor': {
              'source': {},
              'logic': [],
              'extra': extra
          },
          'ScriptSystemEnv': systemEnv
      };

      try {

          const flow = this.editor.toJSON();
          const orderedFlow = this.reorderFlow(this.editor.toJSON());

          console.log('Ordered flow: ', orderedFlow);

          let pos = 0;
          let notificationSourcePos = 0;
          let notificationSource = '';
          let isFlogoApp = false;
          let flogoAppVolPath = '';
          console.log('Building from: ', flow);

          orderedFlow.forEach(flowNode => {

              console.log('Building from : ', flowNode);


              console.log('Building: ', flowNode.name);

              if (flowNode.name == 'Data Subscriber') {
                  pipelineFlow.AirDescriptor.source = this.buildDataSubscriberDeployObj(flowNode.data.customdata);
              }
              else {
                  // Add logic nodes
                  switch (flowNode.name) {
                  case 'Data Store': {
                      const useReading = flowNode.data.customdata.useReading;
                      const useEnrichedReading = flowNode.data.customdata.useEnrichedReading;

                      if (useReading) {
                          pipelineFlow.AirDescriptor.logic.push(this.buildDataStoreDeployObj(flowNode.data.customdata, null));
                      }

                      if (useEnrichedReading) {
                          const targetField = { 'Name': 'Datastore.TargetField', 'Value': 'Inference.REST..Inferred' };
                          pipelineFlow.AirDescriptor.logic.push(this.buildDataStoreDeployObj(flowNode.data.customdata, targetField));
                      }

                      break;
                  }
                  case 'Data Publisher': {
                      const useReading = flowNode.data.customdata.useReading;
                      const useEnrichedReading = flowNode.data.customdata.useEnrichedReading;

                      if (useReading) {
                          pipelineFlow.AirDescriptor.logic.push(this.buildDataPublisherDeployObj(flowNode.data.customdata, null));
                      }

                      if (useEnrichedReading) {
                          const targetField = { 'Name': 'MQTTPub.TargetField', 'Value': 'Inference.REST..Inferred' };
                          pipelineFlow.AirDescriptor.logic.push(this.buildDataPublisherDeployObj(flowNode.data.customdata, targetField));
                      }

                      break;
                  }
                  case 'Custom Publisher': {
                      pipelineFlow.AirDescriptor.logic.push(this.buildCustomPublisherDeployObj(flowNode.data.customdata));

                      break;
                  }
                  case 'Notification Publisher': {
                      if (notificationSource == 'Rules') {
                          pipelineFlow.AirDescriptor.logic.push(this.buildDataPublisherDeployObj(flowNode.data.customdata, null));
                          const pipeId = 'Pipe_' + pos;
                          const ruleId = 'Rule_' + notificationSourcePos;
                          const listener = {
                              'Name': 'App.NotificationListeners',
                              'Value': '{"' + ruleId + '":' + '["' + pipeId + '"]}',
                          };
                          extra.push(listener);
                      }
                      else if (notificationSource == 'REST Service') {
                          notificationSourcePos = pos;
                          pipelineFlow.AirDescriptor.logic.push(this.buildNotificationRuleDeployObj());
                          pos++;
                          pipelineFlow.AirDescriptor.logic.push(this.buildDataPublisherDeployObj(flowNode.data.customdata, null));

                          const pipeId = 'Pipe_' + pos;
                          const ruleId = 'Rule_' + notificationSourcePos;
                          const listener = {
                              'Name': 'App.NotificationListeners',
                              'Value': '{"' + ruleId + '":' + '["' + pipeId + '"]}',
                          };
                          extra.push(listener);
                      }

                      break;
                  }
                  case 'Filters': {
                      pipelineFlow.AirDescriptor.logic.push(this.buildFiltersDeployObj(flowNode.data.customdata));
                      break;
                  }
                  case 'Inferencing': {
                      pipelineFlow.AirDescriptor.logic.push(this.buildInferencingDeployObj(flowNode.data.customdata));
                      break;
                  }
                  case 'Streaming': {
                      pipelineFlow.AirDescriptor.logic.push(this.buildStreamingDeployObj(flowNode.data.customdata));
                      break;
                  }
                  case 'Rules': {
                      pipelineFlow.AirDescriptor.logic.push(this.buildRulesDeployObj(flowNode.data.customdata));
                      notificationSourcePos = pos;
                      notificationSource = 'Rules';
                      break;
                  }
                  case 'Rule Expression': {
                      pipelineFlow.AirDescriptor.logic.push(this.buildRuleExpressionDeployObj(flowNode.data.customdata));
                      notificationSourcePos = pos;
                      notificationSource = 'Rules';
                      break;
                  }
                  case 'Flogo Flow': {
                      pipelineFlow.AirDescriptor.logic.push(this.buildFlogoFlowDeployObj(flowNode.data.customdata));

                      const volumeName = flowNode.data.customdata.volumeName;
                      const volumePath = flowNode.data.customdata.volumePath;

                      // Add extra section required for Flogo App
                      const volume = {
                          'Name': 'services.$Name$.volumes[0]',
                          // "Value": "${" + volumeName + "}:" + volumePath
                          'Value': volumeName + ':' + volumePath
                      };
                      extra.push(volume);

                      // Set flag to exclude Filter Dummy component which is required for regular pipelines
                      isFlogoApp = true;
                      flogoAppVolPath = flowNode.data.customdata.volumePath;
                      break;
                  }
                  case 'REST Service': {
                      pipelineFlow.AirDescriptor.logic.push(this.buildRESTServiceDeployObj(flowNode.data.customdata));
                      notificationSourcePos = pos;
                      notificationSource = 'REST Service';
                      break;
                  }
                  }
                  pos++;

              }

          });

          if (isFlogoApp) {
              if (deployType == 'Edge') {

                  if (deployerType == 'OH') {
                      systemEnv = {
                          'Demo': '/home/ubuntu/loss-detection-demo',
                          'Platform': this.gateway.platform,
                          'DetachedMode': 'n',
                          'Username': this.gateway.username,
                          'TargetServer': this.gateway.router,
                          'Port': this.gateway.routerPort,
                          'Vol': flogoAppVolPath,
                          'DeployConstrains': '["role == RTSF_Demo"]',
                          'ServiceProperties': '{}'
                      };
                  }
                  else {
                      systemEnv = {
                          'Platform': this.gateway.platform,
                          'DetachedMode': 'n',
                          'Username': this.gateway.username,
                          'TargetServer': this.gateway.router,
                          'Port': this.gateway.routerPort,
                          'Vol': flogoAppVolPath
                      };
                  }

                  pipelineFlow.ScriptSystemEnv = systemEnv;
              }
          }
          else {
              pipelineFlow.AirDescriptor.logic.push(
                  {
                      'name': 'Filter.Dummy',
                      'properties': [
                          { 'Name': 'Logging.LogLevel', 'Value': 'INFO' }
                      ]
                  }
              );
          }


          console.log('Pipeline flow to be build: ', pipelineFlow);
          console.log('Pipeline flow to be build string: ', JSON.stringify(pipelineFlow));

      }
      catch (e) {
          console.log('Error: ', e);

          pipelineFlow = null;
      }

      return pipelineFlow;

  }

  validatePipeline() {

      const pipelineId = this.pipelineForm.get('uid').value;
      const pipelineFlow = this.buildPipelineRequest(pipelineId);

      if (pipelineFlow != null) {
          this.flogoDeployService.validateF1(pipelineId, pipelineFlow)
              .subscribe(res => {
                  console.log('Received Validation response: ', res);

                  let message = 'Success';
                  if (res == undefined || res.Success == false) {
                      message = 'Failure';
                  }

                  this._snackBar.open(message, 'Pipeline Validated', {
                      duration: 3000,
                  });

              });
      }
      else {
          this._snackBar.open('Error', 'Pipeline Validated', {
              duration: 3000,
          });
      }



  }

  deployPipeline() {

      const pipelineId = this.pipelineForm.get('uid').value;
      const pipelineFlow = this.buildPipelineRequest(pipelineId);

      if (pipelineFlow != null) {
          this.flogoDeployService.deployF1(pipelineId, pipelineFlow)
              .subscribe(res => {
                  console.log('Received Deployment response: ', res);

                  this.pipelineForm.patchValue({
                      status: 'Deployed',
                  });

                  this.updatePipelineToGraph(false);

                  this.deployDisabled = true;
                  this.undeployDisabled = false;

                  let message = 'Success';
                  if (res == undefined || res.Success == false) {
                      message = 'Failure';
                  }

                  this._snackBar.open(message, 'Deploy Pipeline', {
                      duration: 3000,
                  });

              });
      }
      else {
          this._snackBar.open('Error', 'Pipeline Validated', {
              duration: 3000,
          });
      }

  }


  undeployPipeline() {


      const pipelineId = this.pipelineForm.get('uid').value;
      const deployType = this.pipelineForm.get('pipelineType').value;
      const deployerType = this.pipelineForm.get('deployerType').value;

      let systemEnv = {};

      if (deployType == 'Edge') {
          systemEnv = {
              'Username': this.gateway.username,
              'TargetServer': this.gateway.router,
              'Port': this.gateway.routerPort
          };
      }

      const pipelineFlow = {
          'Method': 'Script',
          'ScriptSystemEnv': systemEnv
      };

      console.log('Undeploy Pipeline flow: ', pipelineId);

      this.flogoDeployService.undeployF1(pipelineId, pipelineFlow)
          .subscribe(res => {
              console.log('Received Undeploy response: ', res);

              this.pipelineForm.patchValue({
                  status: 'Saved',
              });

              this.updatePipelineToGraph(false);

              this.deployDisabled = false;
              this.undeployDisabled = true;

              let message = 'Success';
              if (res == undefined || res.Success == false) {
                  message = 'Failure';
              }

              this._snackBar.open(message, 'Undeploy Pipeline', {
                  duration: 3000,
              });

          });

  }


  buildDataSubscriberDeployObj(contextObj): any {

      let sourceType = '';
      // Events coming from Edgex MQTT (includes envelope for payload)
      if (contextObj.topic == 'edgexevents') {
          sourceType = 'DataSource.EDGEX_' + contextObj.protocol;
      }
      // Events coming  from ZMQToMQTT
      else {
          sourceType = 'DataSource.' + contextObj.protocol;
      }
      const sourceObj = {
          name: sourceType,
          properties: this.buildSubscriberDeployProperties(contextObj)
      };

      return sourceObj;
  }

  buildDataPublisherDeployObj(contextObj, targetField): any {
      // let pipeType = "Pipe." + contextObj.protocol + "2";
      const pipeType = 'Pipe.' + contextObj.protocol + '_FS';
      const pipeObj = {
          name: pipeType,
          properties: this.buildPublisherDeployProperties(contextObj)
      };

      // Add custom target field to properties if provided.
      // Target field is provided when publishing inferred values.
      if (targetField != null) {
          pipeObj.properties.push(targetField);
          if (contextObj.encodeEnrichedReadingValue) {
              pipeObj.properties.push({ 'Name': 'MQTTPub.EncodeReadingValue', 'Value': 'true' });
          }
      // else {
      //   pipeObj.properties.push({ "Name": "MQTTPub.EncodeReadingValue", "Value": "false" })
      // }
      }
      // Regular publisher requires to know if encoding of value is required
      else {
          if (contextObj.encodeReadingValue) {
              pipeObj.properties.push({ 'Name': 'MQTTPub.EncodeReadingValue', 'Value': 'true' });
          }
      // else {
      //   pipeObj.properties.push({ "Name": "MQTTPub.EncodeReadingValue", "Value": "false" })
      // }
      }

      return pipeObj;
  }


  buildCustomPublisherDeployObj(contextObj): any {
      const pipeType = 'Pipe.' + contextObj.protocol + '_FS';
      const pipeObj = {
          name: pipeType,
          properties: this.buildPublisherDeployProperties(contextObj)
      };

      pipeObj.properties.push({ 'Name': 'MQTTPub.PublishData', 'Value': 'Inference.REST..Inferred' });

      return pipeObj;
  }

  /**
   *
   * @param contextObj
   */
  buildSubscriberDeployProperties(contextObj): any {

      let protocolObj = null;

      if (contextObj.protocol == 'MQTT') {

          const encpass = 'SECRET:' + btoa(contextObj.password);

          protocolObj = [
              { 'Name': 'Data.Gateway', 'Value': this.gatewayId },
              { 'Name': 'MQTTTrigger.Topic', 'Value': contextObj.topic },
              { 'Name': 'MQTTTrigger.MaximumQOS', 'Value': contextObj.maximumQOS },
              { 'Name': 'Mqtt.IoTMQTT.Broker_URL', 'Value': 'tcp://' + contextObj.hostname + ':' + contextObj.port },
              { 'Name': 'Mqtt.IoTMQTT.Username', 'Value': contextObj.username },
              { 'Name': 'Mqtt.IoTMQTT.Password', 'Value': encpass },
              { 'Name': 'Mqtt.encryptionMode', 'Value': 'changeme' },
              { 'Name': 'Mqtt.caCertificate', 'Value': 'changeme' },
              { 'Name': 'Mqtt.clientCertificate', 'Value': 'changeme' },
              { 'Name': 'Mqtt.clientKey', 'Value': 'changeme' },
              { 'Name': 'Logging.LogLevel', 'Value': contextObj.logLevel }
          ];
      }
      else if (contextObj.protocol == 'Kafka') {

          protocolObj = [
              { 'Name': 'Kafka.IoTKafka.Brokers', 'Value': 'hostname' + ':' + 'port' },
              { 'Name': 'Kafka.IoTKafka.Connection_Timeout', 'Value': 'connectionTimeout' },
              { 'Name': 'Kafka.IoTKafka.Retry_Backoff', 'Value': 'retryBackoff' },
              { 'Name': 'Kafka.IoTKafka.AuthMode', 'Value': 'authMode' },
              { 'Name': 'Kafka.IoTKafka.Username', 'Value': 'username' },
              { 'Name': 'Kafka.IoTKafka.Password', 'Value': 'password' },
              { 'Name': 'Kafka.IoTKafka.ClientCertificate', 'Value': 'clientCertificate' },
              { 'Name': 'Kafka.IoTKafka.ClientKey', 'Value': 'clientKey' },
              { 'Name': 'Kafka.IoTKafka.ServerCertificate', 'Value': 'serverCertificate' },
              { 'Name': 'KafkaTrigger.ConsumerGroupId', 'Value': 'consumerGroupId' },
              { 'Name': 'KafkaTrigger.Topic', 'Value': 'topic' },
              { 'Name': 'KafkaTrigger.SessionTimeout', 'Value': 'sessionTimeout' },
              { 'Name': 'KafkaTrigger.CommitInterval', 'Value': 'commitInterval' },
              { 'Name': 'KafkaTrigger.InitialOffset', 'Value': 'initialOffset' },
              { 'Name': 'KafkaTrigger.FetchMinBytes', 'Value': 'fetchMinBytes' },
              { 'Name': 'KafkaTrigger.FetchMaxWait', 'Value': 'fetchMaxWait' },
              { 'Name': 'KafkaTrigger.HeartbeatInterval', 'Value': 'heartbeatInterval' }
          ];
      }

      console.log('>>> Build protocol properties: ', contextObj);
      console.log('>>> Build protocol properties: ', protocolObj);


      return protocolObj;

  }

  /**
   *
   * @param contextObj
   */
  buildPublisherDeployProperties(contextObj): any {

      let protocolObj = null;

      if (contextObj.protocol == 'MQTT') {

          const encpass = 'SECRET:' + btoa(contextObj.password);

          protocolObj = [
              { 'Name': 'MQTTPub.Topic', 'Value': contextObj.topic },
              { 'Name': 'MQTTPub.MaximumQOS', 'Value': contextObj.maximumQOS },
              { 'Name': 'Mqtt.IoTMQTT.Broker_URL', 'Value': 'tcp://' + contextObj.hostname + ':' + contextObj.port },
              { 'Name': 'Mqtt.IoTMQTT.Username', 'Value': contextObj.username },
              { 'Name': 'Mqtt.IoTMQTT.Password', 'Value': encpass },
              { 'Name': 'Mqtt.encryptionMode', 'Value': 'changeme' },
              { 'Name': 'Mqtt.caCertificate', 'Value': 'changeme' },
              { 'Name': 'Mqtt.clientCertificate', 'Value': 'changeme' },
              { 'Name': 'Mqtt.clientKey', 'Value': 'changeme' },
              { 'Name': 'Logging.LogLevel', 'Value': contextObj.logLevel }
          ];
      }
      else if (contextObj.protocol == 'Kafka') {

          protocolObj = [
              { 'Name': 'Kafka.IoTKafka.Brokers', 'Value': 'hostname' + ':' + 'port' },
              { 'Name': 'Kafka.IoTKafka.Connection_Timeout', 'Value': 'connectionTimeout' },
              { 'Name': 'Kafka.IoTKafka.Retry_Backoff', 'Value': 'retryBackoff' },
              { 'Name': 'Kafka.IoTKafka.AuthMode', 'Value': 'authMode' },
              { 'Name': 'Kafka.IoTKafka.Username', 'Value': 'username' },
              { 'Name': 'Kafka.IoTKafka.Password', 'Value': 'password' },
              { 'Name': 'Kafka.IoTKafka.ClientCertificate', 'Value': 'clientCertificate' },
              { 'Name': 'Kafka.IoTKafka.ClientKey', 'Value': 'clientKey' },
              { 'Name': 'Kafka.IoTKafka.ServerCertificate', 'Value': 'serverCertificate' },
              { 'Name': 'KafkaTrigger.ConsumerGroupId', 'Value': 'consumerGroupId' },
              { 'Name': 'KafkaTrigger.Topic', 'Value': 'topic' },
              { 'Name': 'KafkaTrigger.SessionTimeout', 'Value': 'sessionTimeout' },
              { 'Name': 'KafkaTrigger.CommitInterval', 'Value': 'commitInterval' },
              { 'Name': 'KafkaTrigger.InitialOffset', 'Value': 'initialOffset' },
              { 'Name': 'KafkaTrigger.FetchMinBytes', 'Value': 'fetchMinBytes' },
              { 'Name': 'KafkaTrigger.FetchMaxWait', 'Value': 'fetchMaxWait' },
              { 'Name': 'KafkaTrigger.HeartbeatInterval', 'Value': 'heartbeatInterval' }
          ];
      }
      else if (contextObj.protocol == 'AMQP') {

          protocolObj = [
              { 'Name': 'AMQP.url', 'Value': 'amqp://' + contextObj.username + ':' + contextObj.password + '@' + contextObj.hostname + ':' + contextObj.port + '/' },
              { 'Name': 'AMQP.exchangeName', 'Value': contextObj.exchangeName },
              { 'Name': 'AMQP.exchangeType', 'Value': contextObj.exchangeType },
              { 'Name': 'AMQP.routingKey', 'Value': contextObj.routingKey },
              { 'Name': 'AMQP.reliable', 'Value': contextObj.reliable }
          ];
      }

      console.log('>>> Build protocol properties: ', contextObj);
      console.log('>>> Build protocol properties: ', protocolObj);


      return protocolObj;

  }

  buildDataStoreDeployObj(contextObj, targetField): any {
      const dataStoreType = 'DataStore.' + contextObj.dataStore;
      const sourceObj = {
          name: dataStoreType,
          properties: this.buildDataStoreDeployProperties(contextObj)
      };

      // Add custom target field to properties if provided
      if (targetField != null) {
          sourceObj.properties.push(targetField);
      }

      return sourceObj;
  }

  /**
   *
   * @param protocol
   * @param form
   */
  buildDataStoreDeployProperties(contextObj): any {

      let dataStoreObj = null;
      const encpass = 'SECRET:' + btoa(contextObj.password);

      if (contextObj.dataStore == 'PostgreSQL2') {

          dataStoreObj = [
              { 'Name': 'PostgreSQL.IoTPostgres.Host', 'Value': contextObj.host },
              { 'Name': 'PostgreSQL.IoTPostgres.Port', 'Value': contextObj.port.toString() },
              { 'Name': 'PostgreSQL.IoTPostgres.Database_Name', 'Value': contextObj.databaseName },
              { 'Name': 'PostgreSQL.IoTPostgres.User', 'Value': contextObj.user },
              { 'Name': 'PostgreSQL.IoTPostgres.Password', 'Value': contextObj.password },
              { 'Name': 'Logging.LogLevel', 'Value': contextObj.logLevel }
          ];
      }
      else if (contextObj.dataStore == 'Snowflake') {

          dataStoreObj = [
              { 'Name': '', 'Value': contextObj.accountName },
              { 'Name': '', 'Value': contextObj.accountName },
              { 'Name': '', 'Value': contextObj.database },
              { 'Name': '', 'Value': contextObj.schema },
              { 'Name': '', 'Value': contextObj.authType },
              { 'Name': '', 'Value': contextObj.username },
              { 'Name': '', 'Value': contextObj.password },
              { 'Name': '', 'Value': contextObj.clientId },
              { 'Name': '', 'Value': contextObj.clientSecret },
              { 'Name': '', 'Value': contextObj.authorizationCode },
              { 'Name': '', 'Value': contextObj.redirectURI },
              { 'Name': '', 'Value': contextObj.loginTimeout }
          ];
      }
      else if (contextObj.dataStore == 'TGDB') {

          dataStoreObj = [
              { 'Name': 'GraphBuilder_TGDB.IoTTGDB.TGDB_Server_URL', 'Value': contextObj.url },
              { 'Name': 'GraphBuilder_TGDB.IoTTGDB.Username', 'Value': contextObj.username },
              { 'Name': 'GraphBuilder_TGDB.IoTTGDB.Password', 'Value': contextObj.password }
          ];
      }
      else if (contextObj.dataStore = 'Dgraph') {

          dataStoreObj = [
              { 'Name': 'GraphBuilder_dgraph.IoTDgraph.Dgraph_Server_URL', 'Value': contextObj.url },
              { 'Name': 'GraphBuilder_dgraph.IoTDgraph.Username', 'Value': contextObj.username },
              { 'Name': 'GraphBuilder_dgraph.IoTDgraph.Password', 'Value': contextObj.password }
          ];

      }

      return dataStoreObj;

  }

  buildFiltersDeployObj(contextObj): any {
      const filtersType = 'Filter.Default';
      const filterObj = {
          name: filtersType,
          properties: this.buildFiltersDeployProperties(contextObj)
      };

      return filterObj;

  }

  /**
   * @param contextObj
   */
  buildFiltersDeployProperties(contextObj): any {

      const filterObj = [
          { 'Name': 'Logging.LogLevel', 'Value': 'DEBUG' },
          { 'Name': 'Filter.Conditions', 'Value': JSON.stringify(contextObj.filters) }
      ];

      return filterObj;
  }

  buildInferencingDeployObj(contextObj): any {

      console.log('Inference Context: ', contextObj);

      const inferencingType = 'Inference.REST';
      const inferencingObj = {
          name: inferencingType,
          properties: this.buildInferencingDeployProperties(contextObj)
      };

      console.log('Deploy inferencingObj: ', inferencingObj);


      return inferencingObj;

  }

  /**
   * @param contextObj
   */
  buildInferencingDeployProperties(contextObj): any {

      const urlMapping = [];

      console.log('Input Template: ', contextObj.inputTemplate);

      const mapping = {
          'Alias': '0',
          'URL': contextObj.modelUrl
      };
      urlMapping.push(mapping);

      console.log('Input Template clear : ', atob(contextObj.inputTemplate));

      // let dataStr1 = `{"Data":"@f1..value@"}`
      const inferenceData = atob(contextObj.inputTemplate);
      const inferenceObj = [
          { 'Name': 'Logging.LogLevel', 'Value': contextObj.logLevel },
          { 'Name': 'REST.Timeout', 'Value': '40000' },
          { 'Name': 'REST.InferenceData', 'Value': inferenceData },
          { 'Name': 'REST.Conditions', 'Value': JSON.stringify(contextObj.filters) },
          { 'Name': 'REST.URLMapping', 'Value': JSON.stringify(urlMapping) }
      ];

      return inferenceObj;
  }

  buildStreamingDeployObj(contextObj): any {

      console.log('Streaming Context: ', contextObj);

      const streamingType = 'Aggregate.Stream';
      const streamingObj = {
          name: streamingType,
          properties: this.buildStreamingDeployProperties(contextObj)
      };

      return streamingObj;

  }

  /**
   * @param contextObj
   */
  buildStreamingDeployProperties(contextObj): any {

      const streamingObj = [
          { 'Name': 'Logging.LogLevel', 'Value': contextObj.logLevel },
          { 'Name': 'Streaming.ProceedOnEmit', 'Value': 'true' },
          { 'Name': 'Streaming.Resolution', 'Value': '1' },
          // { "Name": "Streaming.InputField", "Value": "f1..value" },
          { 'Name': 'Streaming.DeviceName', 'Value': contextObj.deviceName },
          { 'Name': 'Streaming.InstrumentName', 'Value': contextObj.instrumentName },
          { 'Name': 'Streaming.Function', 'Value': contextObj.function },
          { 'Name': 'Streaming.WindowType', 'Value': contextObj.windowType },
          { 'Name': 'Streaming.WindowSize', 'Value': contextObj.windowSize }
      ];

      return streamingObj;
  }

  buildRulesDeployObj(contextObj): any {

      console.log('Rules Context: ', contextObj);

      const ruleType = 'Rule.Default';
      const ruleObj = {
          name: ruleType,
          properties: this.buildRulesDeployProperties(contextObj)
      };

      return ruleObj;

  }

  /**
   * @param contextObj
   */
  buildRulesDeployProperties(contextObj): any {

      const ruleDescriptor = {
          'actionDevice': contextObj.actionDevice,
          'actionNotification': contextObj.actionNotification,
          'actionResource': contextObj.actionResource,
          'actionSendCommand': contextObj.actionSendCommand,
          'actionSendNotification': contextObj.actionSendNotification,
          'actionValue': contextObj.actionValue,
          'condCompareLastMetricToValue': contextObj.condCompareLastMetricToValue,
          'condCompareLastMetricToValueOp': contextObj.condCompareLastMetricToValueOp,
          'condCompareLastMetricValue': contextObj.condCompareLastMetricValue,
          'condCompareNewMetricToLastMetric': contextObj.condCompareNewMetricToLastMetric,
          'condCompareNewMetricToLastMetricOp': contextObj.condCompareNewMetricToLastMetricOp,
          'condCompareNewMetricToValue': contextObj.condCompareNewMetricToValue,
          'condCompareNewMetricToValueOp': contextObj.condCompareNewMetricToValueOp,
          'condCompareNewMetricValue': contextObj.condCompareNewMetricValue,
          'condDevice': contextObj.condDevice,
          'condResource': contextObj.condResource,
          'created': 1615472546736,
          'description': contextObj.description,
          'modified': 1615472546736,
          'name': contextObj.name,
          'uuid': 'Test'
      };

      const ruleObj = [
          { 'Name': 'Logging.LogLevel', 'Value': contextObj.logLevel },
          { 'Name': 'Rule.TupleDescriptor', 'Value': JSON.stringify(this.ruleTuplesDescriptor) },
          { 'Name': 'Rule.DefaultRuleDescriptor', 'Value': JSON.stringify(ruleDescriptor) },
      ];

      return ruleObj;
  }

  buildRuleExpressionDeployObj(contextObj): any {

      console.log('Rule Expression Context: ', contextObj);

      const ruleType = 'Rule.Expression';
      const ruleObj = {
          name: ruleType,
          properties: this.buildRuleExpressionDeployProperties(contextObj)
      };

      return ruleObj;

  }

  /**
   * @param contextObj
   */
  buildRuleExpressionDeployProperties(contextObj): any {

      const ruleExpressionFilter = [
          {
              name: contextObj.resource,
              device: contextObj.device
          }
      ];

      const strArr = contextObj.compareToValue.split(',');
      const valuesArr = [];

      for (const val of strArr) {
          valuesArr.push(Number(val));
      }

      const ruleExpressionThreshold = [
          {
              name: contextObj.resource,
              value: valuesArr,
              notificationLevel: contextObj.notificationLevel,
              notification: contextObj.notification
          }
      ];

      const ruleObj = [
          { 'Name': 'Logging.LogLevel', 'Value': contextObj.logLevel },
          { 'Name': 'Rule.Filter', 'Value': JSON.stringify(ruleExpressionFilter) },
          { 'Name': 'Rule.Threshold', 'Value': JSON.stringify(ruleExpressionThreshold) },
      ];

      return ruleObj;
  }

  buildFlogoFlowDeployObj(contextObj): any {

      console.log('Flogo Flow Context: ', contextObj);

      const flogoFlowType = 'Flogo.Default';
      const flogoFlowObj = {
          name: flogoFlowType,
          flogoApp: contextObj.flowDefinition,
          properties: this.buildFlogoFlowDeployProperties(contextObj),
          ports: this.buildFlogoFlowPortMapping(contextObj)
      };

      return flogoFlowObj;

  }

  /**
   * @param contextObj
   */
  buildFlogoFlowDeployProperties(contextObj): any {

      const flogoProperties = JSON.parse(contextObj.flowProperties);

      // Traverse flogo properties and make a copy without the Type
      const flogoFlowPropertiesObj = [];
      flogoProperties.forEach(flogoProp => {

          // Convert numeric values to string
          let value = flogoProp.Value;
          if (typeof value == 'number') {
              value = flogoProp.Value.toString();
          }

          const prop = {
              'Name': flogoProp.Name,
              'Value': value
          };
          flogoFlowPropertiesObj.push(prop);
      });


      flogoFlowPropertiesObj.push({ 'Name': 'FLOGO_HTTP_SERVICE_PORT', 'Value': contextObj.httpServicePort });
      flogoFlowPropertiesObj.push({ 'Name': 'FLOGO_APP_PROPS_ENV', 'Value': contextObj.propsEnv });

      return flogoFlowPropertiesObj;
  }

  buildFlogoFlowPortMapping(contextObj): any {
      const ports = [];

      const portMap1 = contextObj.portMap1;
      const portMap2 = contextObj.portMap2;

      if (portMap1 != '') {
          ports.push(portMap1);
      }

      if (portMap2 != '') {
          ports.push(portMap2);
      }

      return ports;
  }

  buildRESTServiceDeployObj(contextObj): any {

      console.log('RESTService Context: ', contextObj);

      const restServiceType = 'Inference.REST';
      const restServiceObj = {
          name: restServiceType,
          properties: this.buildRESTServiceDeployProperties(contextObj)
      };

      return restServiceObj;

  }

  /**
   * @param contextObj
   */
  buildRESTServiceDeployProperties(contextObj): any {

      const inferenceData = {
          'ID': '@f1..id@',
          'Name': '@f1..name@',
          'Value': '@f1..value@'
      };

      let alias = 0;
      const urlMapping = [];
      contextObj.filters.forEach(element => {
          const mapping = {
              'Alias': alias.toString(),
              'URL': contextObj.url
          };
          urlMapping.push(mapping);
          alias++;
      });



      const propertiesObj = [
          { 'Name': 'Logging.LogLevel', 'Value': contextObj.logLevel },
          { 'Name': 'REST.Timeout', 'Value': '10000' },
          { 'Name': 'REST.InferenceData', 'Value': JSON.stringify(inferenceData) },
          { 'Name': 'REST.Conditions', 'Value': JSON.stringify(contextObj.filters) },
          { 'Name': 'REST.URLMapping', 'Value': JSON.stringify(urlMapping) }
      ];

      return propertiesObj;
  }

  buildNotificationRuleDeployObj(): any {

      const notificationRuleType = 'Rule.TextMatching';
      const notificationRuleObj = {
          name: notificationRuleType,
          properties: this.buildNotificationRuleDeployProperties()
      };

      return notificationRuleObj;

  }

  /**
   * @param contextObj
   */
  buildNotificationRuleDeployProperties(): any {

      const ruleMatching = [
          { 'type': 'contains', 'value': 'ERROR' },
          { 'type': 'contains', 'value': 'WARN' }
      ];

      const propertiesObj = [
          { 'Name': 'Logging.LogLevel', 'Value': 'INFO' },
          { 'Name': 'Rule.TargetField', 'Value': '@Inference.REST..Inferred@' },
          { 'Name': 'Rule.Matching', 'Value': JSON.stringify(ruleMatching) }
      ];

      return propertiesObj;
  }
}


