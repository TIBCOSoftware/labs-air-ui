import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { PipelineService } from '../../services/pipeline/pipeline.service';
import { Device, Filter } from '../../models/iot.model';

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
import { Gateway, RestEndpoint, Pipeline } from '@TIBCOSoftware/labs-air-graph-client';
import { PythonComponent } from '../rete/components/python-component';
import { PythonPipeComponent } from '../rete/components/python-pipe-component'
import { Observable, Subject, Subscriber, Subscription } from 'rxjs';
import {ProxyService} from "../../services/graph/proxy.service";
import {debug} from "ng-packagr/lib/utils/log";
@Component({
    selector: 'app-common-iot-pipeline',
    templateUrl: './iot-pipeline.component.html',
    styleUrls: ['./iot-pipeline.component.css']
})
export class CommonIotPipelineComponent implements OnInit, OnDestroy, AfterViewInit {

    gatewayId = '';
    gateway = null as Gateway;
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

    // should this be just one big form? 
    pipelineForm: UntypedFormGroup;
    artifacts = [];

    selectedNode: any;

    pipelineObserver: Subscription;
    nodeChangeEvent: Subject<any> = new Subject<any>();

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

    constructor(private graphService: ProxyService,
        private route: ActivatedRoute,
        private formBuilder: UntypedFormBuilder,
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
        this.pipelineService.pipelineSelection.clear();
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

    get models(): RestEndpoint[] {
        return this.pipelineService.models;
    }

    get devices(): Device[] {
        return this.pipelineService.devices;
    }

    get filters(): Filter[] {
        return this.pipelineService.filters;
    }

    async ngAfterViewInit() {

        console.log('PipelineEditor - ngAfterViewInit - devices: ', this.devices);

        if (this.pipelineService.artifacts.length == 0) {
            this.pipelineService.buildPythonPipeArtifacts();
        }

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

                this.lastNodeSelected = null;

                this.resetNodeContext(null);

            }
        });

        // Handle node selected events
        this.editor.on('nodeselected', node => {
            console.log('Editor node selected', node);
            console.log('Node data: ', node.data);
            this.pipelineService.filters = [];

            if (node.name == 'Python Pipe') {
                this.getPythonInputOutput(node);
            }

            this.nodeChangeEvent.next(node);

            this.lastNodeSelected = node;

            this.resetNodeContext(node);

        });


        this.editor.on('click', (async () => {

            console.log('Editor selected');

            if (this.lastNodeSelected != null) {

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
                    this.dataSubscriberConfig = true;
                    break;
                }
                case 'Data Store': {
                    this.dataStoreConfig = true;
                    break;
                }
                case 'Data Publisher': {

                    this.dataPublisherConfig = true;
                    break;
                }
                case 'Custom Publisher': {
                    this.dataPublisherConfig = true;
                    break;
                }
                case 'Notification Publisher': {
                    this.dataPublisherConfig = true;
                    break;
                }
                case 'Filters': {
                    this.filteringConfig = true;
                    break;
                }
                case 'Inferencing': {
                    this.inferencingConfig = true;
                    break;
                }
                case 'Streaming': {
                    this.streamingConfig = true;
                    break;
                }
                case 'Rules': {
                    this.rulesConfig = true;
                    break;
                }
                case 'Rule Expression': {
                    this.ruleExpressionConfig = true;
                    break;
                }
                case 'Rule Text Matching': {
                    this.ruleTextMatchingConfig = true;
                    break;
                }
                case 'Flogo Flow': {
                    this.flogoFlowConfig = true;
                    break;
                }
                case 'REST Service': {
                    this.restServiceConfig = true;
                    break;
                }
                case 'Python': {
                    this.pythonConfig = true;
                    break;
                }
                case 'REST Broadcast': {
                    this.restBroadcastConfig = true;
                    break;
                }
                case 'MQTT Request Reply': {
                    this.requestReplyConfig = true;
                    break;
                }
                case 'Python Pipe': {
                    this.pythonPipeConfig = true;
                    break;
                }
                case 'Error Handler': {
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
    createForms() {

        this.pipelineForm = this.formBuilder.group({
            uuid: ['', Validators.required],
            name: ['', Validators.required],
            pipelineType: ['', Validators.required],
            deployerType: ['', Validators.required],
            description: ['', Validators.required],
            created: [0, Validators.required],
            modified: [0, Validators.required],
            status: ['', Validators.required],
            flowConfiguration: ['', Validators.required],
            subscriptionTopic: ['', Validators.required],
            logLevel: ['INFO', Validators.required]
        });
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
            uuid: '',
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
        this.pipelineService.pipelineData = this.pipelineForm.getRawValue();
        this.pipelineService.deletePipelineFromGraph();
    }

    printPipeline() {
        this.pipelineService.pipelineData = this.pipelineForm.getRawValue();
        this.pipelineService.printPipeline();
    }

    deployPipeline() {
        this.pipelineService.pipelineData = this.pipelineForm.getRawValue();
        this.pipelineService.deployPipeline();
    }

    undeployPipeline() {
        this.pipelineService.pipelineData = this.pipelineForm.getRawValue();
        this.pipelineService.undeployPipeline();
    }

    validatePipeline() {
        this.pipelineService.pipelineData = this.pipelineForm.getRawValue();
        this.pipelineService.validatePipeline();
    }

    setPipelineForm(pipeline: Pipeline) {
        this.pipelineForm.patchValue({
            uuid: pipeline.uuid,
            name: pipeline.name,
            pipelineType: pipeline.pipelineType,
            deployerType: pipeline.deployerType,
            description: pipeline.description,
            status: pipeline.status,
            flowConfiguration: pipeline.flowConfiguration,
            logLevel: pipeline.logLevel,
            subscriptionTopic: pipeline.subscriptionTopic
        });
    }

    saveToCanvas(eventData: any) {
        const node = this.editor.nodes.find(node => node.id === this.selectedNode.id)
        node.data['customdata'] = eventData;
        console.log('saving nodes', this.editor.nodes);
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

    updateFilters(filters) {
        const filtersObj = { filters: filters }
        this.saveToCanvas(filtersObj);
        this.pipelineService.filters = filters;
    }

}
