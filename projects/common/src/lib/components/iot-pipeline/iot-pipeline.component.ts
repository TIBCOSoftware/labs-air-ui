import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { GraphService } from '@TIBCOSoftware/labs-air-graph-client';
import { PipelineService } from '../../services/pipeline/pipeline.service';
import { Device } from '../../models/iot.model';

import { PipelineFilteringComponent } from './pipeline-filtering/pipeline-filtering.component';
import { PipelineInferencingComponent } from './pipeline-inferencing/pipeline-inferencing.component';
import { PipelineRestServiceComponent } from './pipeline-rest-service/pipeline-rest-service.component';
// Rete editor specific
import { NodeEditor, Engine } from 'rete';
import ConnectionPlugin from 'rete-connection-plugin';
import { AngularRenderPlugin } from 'rete-angular-render-plugin';
import ContextMenuPlugin from 'rete-context-menu-plugin';

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
import { RuleTextMatchingComponent } from '../rete/components/rule-text-matching-component';
import { StreamingComponent } from '../rete/components/streaming-component';
import { NotificationPublisherComponent } from '../rete/components/notification-publisher-component';
import { FlogoFlowComponent } from '../rete/components/flogo-flow-component';
import { RestServiceComponent } from '../rete/components/rest-service-component';
import { NodePrimaryComponent } from '../rete/nodes/node-primary/node-primary.component';
import { RestBroadcastComponent } from '../rete/components/rest-broadcast.component'
import { MQTTRequestReplyComponent } from '../rete/components/mqtt-request-reply.component'
import { Gateway, Model, Pipeline } from '@TIBCOSoftware/labs-air-graph-client';
import { PythonComponent } from '../rete/components/python-component';
import { PythonPipeComponent } from '../rete/components/python-pipe-component'
import { Observable, Subject, Subscriber, Subscription } from 'rxjs';
@Component({
    selector: 'app-common-iot-pipeline',
    templateUrl: './iot-pipeline.component.html',
    styleUrls: ['./iot-pipeline.component.css']
})
export class CommonIotPipelineComponent implements OnInit, OnDestroy, AfterViewInit {

    gatewayId = '';
    gateway = null as Gateway;
    devices: Device[] = [];
    // pipelineSelected = this.pipelineService.pipelineSelected;  // Used to control the display of buttons

    dateFormat = 'yyyy-MM-dd  HH:mm:ss';
    translated = false;

    pipelineDisplayedColumns: string[] = ['id', 'name', 'pipelineType', 'status', 'created', 'modified'];

    pythonInputs = [];

    pipelineConfig = true;
    dataSubscriberConfig = false;
    filteringConfig = false;
    dataStoreConfig = false;
    dataPublisherConfig = false;
    inferencingConfig = false;
    rulesConfig = false;
    ruleExpressionConfig = false;
    ruleTextMatchingConfig = false;
    streamingConfig = false;
    flogoFlowConfig = false;
    restServiceConfig = false;
    pythonConfig = false;
    restBroadcastConfig = false;
    requestReplyConfig = false;
    pythonPipeConfig = false;
    errorHandlerConfig = false;
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
    ruleTextMatchingForm: FormGroup;
    flogoFlowForm: FormGroup;
    restServiceForm: FormGroup;
    dataOptionsForm: FormGroup;
    pythonForm: FormGroup;
    restBroadcastForm: FormGroup;
    requestReplyForm: FormGroup;
    pythonPipeForm: FormGroup;
    errorHandlerForm: FormGroup;
    artifacts = [];

    selectedNode: any;

    pipelineObserver: Subscription;
    nodeChangeEvent: Subject<any> = new Subject<any>();

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
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private pipelineService: PipelineService) {
    }

    ngOnInit(): void {
        // Get gateway id from route
        this.gatewayId = this.route.snapshot.paramMap.get('gatewayId');
        this.pipelineService.gatewayId = this.gatewayId;

        this.pipelineObserver = this.pipelineService.pipelineChange.subscribe(value => {
            if (value.type == 'clearForm') {
                this.clearPipeline();
            }
            if (value.type == 'updatePipelineForm') {
                this.setPipelineForm(value.pipeline)
            }
        })
        // this.getGatewayDetails(this.gatewayId);
        this.pipelineService.getGatewayDetails(this.gatewayId);

        this.createForms();
    }

    ngOnDestroy(): void {
        this.pipelineObserver.unsubscribe();
    }

    get pipelinesDataSource(): MatTableDataSource<Pipeline> {
        return this.pipelineService.pipelinesDataSource
    }

    get pipelineSelection(): SelectionModel<Pipeline> {
        return this.pipelineService.pipelineSelection;
    }

    get deployDisabled(): boolean {
        return this.pipelineService.deployDisabled;
    }

    get undeployDisabled(): boolean {
        return this.pipelineService.undeployDisabled;
    }

    get pipelineSelected(): boolean {
        return this.pipelineService.pipelineSelected;
    }

    get models(): Model[] {
        return this.pipelineService.models;
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
            new RuleTextMatchingComponent(),
            new RestServiceComponent(),
            new RestBroadcastComponent(),
            new MQTTRequestReplyComponent(),
            new NotificationPublisherComponent(),
            new ImageResizeComponent(),
            new CustomPublisherComponent(),
            new FlogoFlowComponent(),
            new ErrorHandlerComponent(),
            new PythonComponent(),
            new PythonPipeComponent()
        ];

        this.editor = new NodeEditor('demo@0.2.0', container);

        this.pipelineService.editor = this.editor;

        this.editor.use(ConnectionPlugin);
        console.log('AngularRenderPlugin', AngularRenderPlugin);
        this.editor.use(AngularRenderPlugin, { component: NodePrimaryComponent });
        this.editor.use(ContextMenuPlugin, {
            
        });

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
            (async (data) => {
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

            this.nodeChangeEvent.next(node);

            if (node.name == 'Python Pipe') {
                this.getPythonInputOutput(node);
            }

            if (this.lastNodeSelected != null) {

                // Clean shared variables
                this.clearFormsAndFilters();
            }

            this.lastNodeSelected = node;

            this.resetNodeContext(node);

        });


        this.editor.on('click', (async () => {

            console.log('Editor selected');

            if (this.lastNodeSelected != null) {

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

    // shows the form for which node was selected
    resetNodeContext(node) {

        this.pipelineConfig = false;
        this.dataSubscriberConfig = false;
        this.filteringConfig = false;
        this.dataStoreConfig = false;
        this.dataPublisherConfig = false;
        this.inferencingConfig = false;
        this.rulesConfig = false;
        this.ruleExpressionConfig = false;
        this.ruleTextMatchingConfig = false;
        this.streamingConfig = false;
        this.flogoFlowConfig = false;
        this.restServiceConfig = false;
        this.pythonConfig = false;
        this.restBroadcastConfig = false;
        this.requestReplyConfig = false;
        this.pythonPipeConfig = false;
        this.errorHandlerConfig = false;

        if (node != null || node != undefined) {
            console.log('Resetting context for node: ', node);
            const contextObj = node.data['customdata'];
            this.selectedNode = node;

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
                    // this.updateInferencingComponent(contextObj);
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
                case 'Rule Text Matching': {
                    this.updateRuleTextMatchingComponent(contextObj);
                    this.ruleTextMatchingConfig = true;
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
                case 'Python': {
                    // this.updatePythonComponent(contextObj);
                    this.pythonConfig = true;
                    break;
                }
                case 'REST Broadcast': {
                    this.updateRESTBroadcastComponent(contextObj);
                    this.restBroadcastConfig = true;
                    break;
                }
                case 'MQTT Request Reply': {
                    this.updateMQTTRequestReplyComponent(contextObj);
                    this.requestReplyConfig = true;
                    break;
                }
                case 'Python Pipe': {
                    // this.updatePythonPipeComponent(contextObj);
                    this.pythonPipeConfig = true;
                    break;
                }
                case 'Error Handler': {
                    this.updateErrorHandlerComponent(contextObj);
                    this.errorHandlerConfig = true;
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
            method: 'PUT',
            headers: new FormArray([]),
            base64Encoded: true
        }, { emitEvent: false });

        this.restServiceForm.reset({
            description: '',
            url: '',
            logLevel: 'INFO',
            method: 'PUT',
            headers: new FormArray([])
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

        this.pythonForm.reset({
            processor: '',
            processorContent: '',
            requirement: '',
            requirementContent: '',
            dockerfile: '',
            dockerfileContent: '',
            volumeName: '',
            volumePath: '',
            dataInput: '',
            producer: ''
        });
        this.requestReplyForm.reset();
        this.pythonPipeForm.patchValue({
            logLevel: 'INFO',
            timeout: '600',
            fileContent: '',
            dataInput: '{\"command\":\"process\", \"data\":{}}',
            name: '',
            context: {
                name: '',
                data: {}
            }
        });
        // resetting a form group and form array require explicit calls or they don't reset.
        (this.pythonPipeForm.get('context').get('data') as FormGroup).setControl('input', new FormGroup({}));
        (this.pythonPipeForm.get('context').get('data') as FormGroup).setControl('output', new FormArray([]));
        (this.pythonPipeForm.get('context').get('data') as FormGroup).setControl('config', new FormArray([]));
        (this.pythonPipeForm.get('context').get('data') as FormGroup).setControl('dependsOn', new FormArray([]));
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
            logLevel: ['INFO', Validators.required],
            method: ['PUT', Validators.required],
            headers: this.formBuilder.array([]),
            base64Encoded: [true, Validators.required]
        });

        this.restServiceForm = this.formBuilder.group({
            description: ['', Validators.required],
            url: ['', Validators.required],
            logLevel: ['INFO', Validators.required],
            headers: this.formBuilder.array([])
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

        this.ruleTextMatchingForm = this.formBuilder.group({
            name: ['', Validators.required],
            description: [''],
            compareTarget: ['', Validators.required],
            compareOp: ['', Validators.required],
            compareToValue: ['', Validators.required],
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

        this.pythonForm = this.formBuilder.group({
            processor: ['', Validators.required],
            processorContent: [''],
            requirement: ['', Validators.required],
            requirementContent: [''],
            dockerfile: [''],
            dockerfileContent: [''],
            volumeName: [''],
            volumePath: [''],
            dataInput: ['', Validators.required],
            producer: ['', Validators.required]
        });

        this.restBroadcastForm = this.formBuilder.group({
            logLevel: ['info', Validators.required],
            restTimeout: ['60', Validators.required],
            endpointNames: this.formBuilder.array([]),
            restURLs: this.formBuilder.array([]),
            restMethods: this.formBuilder.array([]),
            restBodies: this.formBuilder.array([]),
            headers: this.formBuilder.array([])
        });

        this.requestReplyForm = this.formBuilder.group({
            uid: ['', Validators.required],
            gateway: [this.gatewayId, Validators.required],
            protocolId: ['', Validators.required],
            protocol: ['', Validators.required],
            logLevel: ['INFO', Validators.required],
            timeout: ['', Validators.required],
            dataTemplate: ['', Validators.required],
            producer: ['', Validators.required],
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
        });

        this.pythonPipeForm = this.formBuilder.group({
            logLevel: ['INFO', Validators.required],
            timeout: ['600', Validators.required],
            name: ['', Validators.required],
            context: this.formBuilder.group({
                name: ['', Validators.required],
                data: this.formBuilder.group({
                    input: this.formBuilder.group({}),
                    output: this.formBuilder.array([]),
                    dependsOn: this.formBuilder.array([]),
                    config: this.formBuilder.array([])
                })
            }),
            dataInput: ['{\"command\":\"process\", \"data\":{}}'],
            fileContent: ['']
        });

        this.errorHandlerForm = this.formBuilder.group({
            logLevel: ['INFO', Validators.required]
        });
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
            'method': this.modelForm.get('method').value,
            'headers': this.modelForm.get('headers').value,
            'base64Encoded': this.modelForm.get('base64Encoded').value
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
    buildNodeRuleTextMatchingProperties(): any {

        const ruleObj = {
            'name': this.ruleTextMatchingForm.get('name').value,
            'description': this.ruleTextMatchingForm.get('description').value,
            'compareTarget': this.ruleTextMatchingForm.get('compareTarget').value,
            'compareOp': this.ruleTextMatchingForm.get('compareOp').value,
            'compareToValue': this.ruleTextMatchingForm.get('compareToValue').value,
            'logLevel': this.ruleTextMatchingForm.get('logLevel').value
        };

        console.log('Rule TextMatching context saved: ', ruleObj);

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
            'logLevel': this.restServiceForm.get('logLevel').value,
            'headers': this.restServiceForm.get('headers').value
        };

        console.log('REST Service context saved: ', restServiceObj);

        return restServiceObj;
    }

    buildPythonProperties(): any {

        const pythonObj = {
            'processor': this.pythonForm.get('processor').value,
            'processorContent': this.pythonForm.get('processorContent').value,
            'requirement': this.pythonForm.get('requirement').value,
            'requirementContent': this.pythonForm.get('requirementContent').value,
            'dockerfile': this.pythonForm.get('dockerfile').value,
            'dockerfileContent': this.pythonForm.get('dockerfileContent').value,
            'volumeName': this.pythonForm.get('volumeName').value,
            'volumePath': this.pythonForm.get('volumePath').value,
            'dataInput': this.pythonForm.get('dataInput').value,
            'producer': this.pythonForm.get('producer').value
        };

        return pythonObj;
    }
    buildNodeRestBroadcastServiceProperties(): any {
        const restBroadcastObj = {
            'logLevel': this.restBroadcastForm.get('logLevel').value,
            'restTimeout': this.restBroadcastForm.get('restTimeout').value,
            'restURLs': this.restBroadcastForm.get('restURLs').value,
            'restMethods': this.restBroadcastForm.get('restMethods').value,
            'restBodies': this.restBroadcastForm.get('restBodies').value,
            'headers': this.restBroadcastForm.get('headers').value,
            'endpointNames': this.restBroadcastForm.get('endpointNames').value
        }
        return restBroadcastObj;
    }

    buildNodeMQTTRequestReplyProperties(): any {
        const mqttRequestReplyObj = {
            'uid': this.requestReplyForm.get('uid').value,
            'protocol': this.requestReplyForm.get('protocol').value,
            'protocolId': this.requestReplyForm.get('protocolId').value,
            'logLevel': this.requestReplyForm.get('logLevel').value,
            'hostname': this.requestReplyForm.get('mqtt.hostname').value,
            'port': this.requestReplyForm.get('mqtt.port').value,
            'username': this.requestReplyForm.get('mqtt.username').value,
            'password': this.requestReplyForm.get('mqtt.password').value,
            'encryptionMode': this.requestReplyForm.get('mqtt.encryptionMode').value,
            'caCertificate': this.requestReplyForm.get('mqtt.caCertificate').value,
            'clientCertificate': this.requestReplyForm.get('mqtt.clientCertificate').value,
            'clientKey': this.requestReplyForm.get('mqtt.clientKey').value,
            'topic': this.requestReplyForm.get('mqtt.topic').value,
            'maximumQOS': this.requestReplyForm.get('mqtt.maximumQOS').value,
            'timeout': this.requestReplyForm.get('timeout').value,
            'gateway': this.requestReplyForm.get('gateway').value,
            'dataTemplate': this.requestReplyForm.get('dataTemplate').value,
            'producer': this.requestReplyForm.get('producer').value
        }
        return mqttRequestReplyObj;
    }

    buildPythonPipeProperties(): any {
        const pythonPipeObj = {
            'logLevel': this.pythonPipeForm.get('logLevel').value,
            'timeout': this.pythonPipeForm.get('timeout').value,
            'name': this.pythonPipeForm.get('name').value,
            // need to update context once that is done
            'processorName': this.pythonPipeForm.get('context.name').value,
            'input': this.pythonPipeForm.get('context').get('data').get('input').value,
            'output': this.pythonPipeForm.get('context').get('data').get('output').value,
            'dependsOn': this.pythonPipeForm.get('context').get('data').get('dependsOn').value,
            'config': this.pythonPipeForm.get('context').get('data').get('config').value,
            'dataInput': this.pythonPipeForm.get('dataInput').value,
            'fileContent': this.pythonPipeForm.get('fileContent').value
        }
        return pythonPipeObj;
    }

    /**
     *
     * @param form
     */
    buildNodeErrorHandlerProperties(): any {

        const errorHandlerObj = {
            'logLevel': this.errorHandlerForm.get('logLevel').value
        };

        return errorHandlerObj;
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
                LogLevel: context.logLevel,
                method: context.method,
                base64Encoded: context.base64Encoded
            });

            const formGroups = context.headers.map(x => this.formBuilder.array(x.map(y => this.formBuilder.group(y)))) as [];
            const headersArray = this.formBuilder.array(formGroups) as FormArray
            this.modelForm.setControl('headers', headersArray);

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
    *
    * @param context
    */
    updateRuleTextMatchingComponent(context) {

        if (context != null || context != undefined) {
            console.log('Updating rules component with context: ', context);

            this.ruleTextMatchingForm.patchValue({
                name: context.name,
                description: context.description,
                compareTarget: context.compareTarget,
                compareOp: context.compareOp,
                compareToValue: context.compareToValue,
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

            const formGroups = context.headers.map(x => this.formBuilder.array(x.map(y => this.formBuilder.group(y)))) as [];
            const headersArray = this.formBuilder.array(formGroups) as FormArray
            this.restServiceForm.setControl('headers', headersArray);
        }
    }

    /**
     * Update python component. Stores the UID of each field in dgraph
     */
    updatePythonComponent(context) {
        if (context != null || context != undefined) {

            this.pythonForm.patchValue({
                processor: context.processor,
                processorContent: context.processorContent,
                requirement: context.requirement,
                requirementContent: context.requirementContent,
                dockerfile: context.dockerfile,
                dockerfileContent: context.dockerfileContent,
                volumeName: context.volumeName,
                volumePath: context.volumePath,
                dataInput: context.dataInput,
                producer: context.producer,
            });
        }
    }

    /**
    *
    * @param context
    */
    updateRESTBroadcastComponent(context: any) {
        if (context != null || context != undefined) {
            this.restBroadcastForm.patchValue({
                logLevel: context.logLevel,
                restTimeout: context.restTimeout,
            });
            this.restBroadcastForm.setControl('endpointNames', this.formBuilder.array(context.endpointNames))
            this.restBroadcastForm.setControl('restURLs', this.formBuilder.array(context.restURLs));
            this.restBroadcastForm.setControl('restMethods', this.formBuilder.array(context.restMethods));
            this.restBroadcastForm.setControl('restBodies', this.formBuilder.array(context.restBodies));

            const formGroups = context.headers.map(x => this.formBuilder.array(x.map(y => this.formBuilder.group(y)))) as [];
            const headersArray = this.formBuilder.array(formGroups) as FormArray
            this.restBroadcastForm.setControl('headers', headersArray);
        }
    }

    /**
   *
   * @param context
   */
    updateMQTTRequestReplyComponent(context: any) {
        if (context != null || context != undefined) {
            this.requestReplyForm.patchValue({
                uid: context.uid,
                protocol: context.protocol,
                protocolId: context.protocolId,
                logLevel: context.logLevel,
                timeout: context.timeout,
                gateway: context.gateway,
                dataTemplate: context.dataTemplate,
                producer: context.producer,
                mqtt: {
                    hostname: context.hostname,
                    port: context.hostname,
                    username: context.username,
                    password: context.password,
                    encryptionMode: context.encryptionMode,
                    caCertificate: context.caCertificate,
                    clientCertificate: context.clientCertificate,
                    clientKey: context.clientKey,
                    topic: context.topic,
                    maximumQOS: context.maximumQOS,
                }
            })
        }
    }

    updatePythonPipeComponent(context: any) {
        if (context != null || context != undefined) {
            this.pythonPipeForm.patchValue({
                logLevel: context.logLevel,
                timeout: context.timeout,
                dataInput: context.dataInput,
                fileContent: context.fileContent,
                name: context.name,
                context: {
                    name: context.processorName
                }
            });
            (this.pythonPipeForm.get('context').get('data') as FormGroup).setControl('input', this.formBuilder.group(context.input));
            const outputs = context.output.map(x => this.formBuilder.control(x));
            (this.pythonPipeForm.get('context').get('data') as FormGroup).setControl('output', new FormArray(outputs));
            const formGroups = context.config.map(x => this.formBuilder.group(x)) as [];
            const configArray = this.formBuilder.array(formGroups) as FormArray
            (this.pythonPipeForm.get('context').get('data') as FormGroup).setControl('config', configArray);
            const dependsOnArray = context.dependsOn.map(x => this.formBuilder.control(x));
            (this.pythonPipeForm.get('context').get('data') as FormGroup).setControl('dependsOn', this.formBuilder.array(dependsOnArray));
        }
    }

    /**
     *
     * @param context
     */
    updateErrorHandlerComponent(context) {

        if (context != null || context != undefined) {
            console.log('Updating error handler component with context: ', context);

            this.errorHandlerForm.patchValue({
                logLevel: context.logLevel,
            });

        }
    }

    /**
     * Handles selection of pipeline on table
     */
    onPipelineClicked(row, updateEditor: boolean) {
        this.pipelineService.onPipelineClicked(row, updateEditor);
    }

    newPipeline() {
        console.log('Deleting pipeline: ', this.pipelineForm);

        if (this.pipelineSelection.hasValue()) {

            this.pipelineService.pipelineSelected = false;

            const pipeline = this.pipelineSelection.selected[0];

            this.pipelineSelection.clear();

            this.clearPipeline();
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
        this.ruleTextMatchingConfig = false;
        this.streamingConfig = false;
        this.flogoFlowConfig = false;
        this.restServiceConfig = false;
        this.restBroadcastConfig = false;
        this.requestReplyConfig = false;
        this.errorHandlerConfig = false;

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

    savePipelineToGraph() {
        this.pipelineService.pipelineData = this.pipelineForm.getRawValue();
        this.pipelineService.savePipelineToGraph();
    }

    deletePipelineFromGraph() {
        this.pipelineService.deletePipelineFromGraph();
    }

    printPipeline() {
        this.pipelineService.printPipeline();
    }

    deployPipeline() {
        this.pipelineService.deployPipeline();
    }

    undeployPipeline() {
        this.pipelineService.undeployPipeline();
    }

    validatePipeline() {
        this.pipelineService.validatePipeline();
    }

    setPipelineForm(pipeline: Pipeline) {
        this.pipelineForm.patchValue({
            uid: pipeline.uid,
            name: pipeline.name,
            pipelineType: pipeline.pipelineType,
            deployerType: pipeline.deployerType,
            description: pipeline.description,
            status: pipeline.status,
            flowConfiguration: pipeline.flowConfiguration,
            logLevel: pipeline.logLevel
        });
    }

    saveToCanvas(eventData: any) {
        const node = this.editor.nodes.find(node => node.id === this.selectedNode.id)
        node.data['customdata'] = eventData;
        console.log(' saving nodes', this.editor.nodes);
    }

    getPythonInputOutput(node) {
        // find all previous python resources connected
        // Rete passes the output of the previous node as the input of the current node
        this.pythonInputs = [];
        this.findPreviousNodes(node);
    }

    findPreviousNodes(node: any): any {
        // assumes only one connection, but currently is only setup to do one connection.
        const previousNode = node.inputs.size > 0 && node?.inputs?.get('event').connections?.length > 0 ? node.inputs.get('event').connections[0].output.node : undefined
        if (previousNode) {
            if (previousNode.name == 'Python Pipe') {
                this.pythonInputs.push(previousNode);
            }
            this.findPreviousNodes(previousNode);
        };
    }

    findNextNode(node: any): any {
        const nextNode = node.outputs.size > 0 ? node.inputs.get('event').connections[0].output.node : undefined;
        if (nextNode.length > 0) {
            return nextNode
        }
    }

}
