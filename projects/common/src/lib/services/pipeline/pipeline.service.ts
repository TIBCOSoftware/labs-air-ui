import { Injectable } from '@angular/core';

import { FlogoDeployService } from '../../services/deployment/flogo-deploy.service';
import { EdgeService } from '../../services/edge/edge.service';

import { Gateway, GraphService, Model, Pipeline } from '@TIBCOSoftware/labs-air-graph-client';

import { NodeEditor } from 'rete';

import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { Device } from '../../models/iot.model';
import { SelectionModel } from '@angular/cdk/collections';
import { Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})

export class PipelineService {

  constructor(
    private graphService: GraphService,
    private flogoDeployService: FlogoDeployService,
    private _snackBar: MatSnackBar,
    private edgeService: EdgeService) { }

  pipelineData: Pipeline;
  gateway: Gateway;
  gatewayId: string;
  editor: NodeEditor;
  deployDisabled = true;
  undeployDisabled = true;
  pipelineSelected = false;
  artifacts = [];
  devices: Device[] = [];
  models: Model[] = [];
  filters = [];
  pipelineSelection = new SelectionModel<Pipeline>(false, []);

  pipelineChange = new Subject<{ type: string, pipeline?: Pipeline }>();

  // pipelinesDataSource = new MatTableDataSource<Pipeline>();
  pipelineDataSource = [];

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
          'name': 'deviceName',
          'type': 'String'
        },
        {
          'name': 'resourceName',
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
          'name': 'deviceName',
          'type': 'String'
        },
        {
          'name': 'resourceName',
          'type': 'String'
        },
        {
          'name': 'value',
          'type': 'string'
        }
      ]
    }
  ]

  validatePipeline() {
    const pipelineId = this.pipelineData.uid;
    const pipelineFlow = this.buildPipelineRequest(pipelineId.toString());
    if (pipelineFlow != null) {
      this.flogoDeployService.validateF1(pipelineId.toString(), pipelineFlow)
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

  buildPipelineRequest(pipelineId: string): any {
    const deployType = this.pipelineData.pipelineType;
    const deployerType = this.pipelineData.deployerType;
    const appLogLevel = this.pipelineData.logLevel;
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
      'Artifacts': [],
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
      const orderedFlow = this.reorderFlow("Data Subscriber", flow);
      const errorFlow = this.reorderFlow("Error Handler", flow);

      console.log('Ordered flow: ', orderedFlow);

      let pos = 0;
      let notificationSourcePos = 0;
      let notificationSource = '';
      let isFlogoApp = false;
      let flogoAppVolPath = '';
      let lastInferenceProducer = '';
      let useGPU = false;
      let producerName = '';
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
                // check to use producer name instead of Inference.REST..Inferred
                let targetField = { 'Name': 'Datastore.TargetField', 'Value': 'Inference.REST..Inferred' };
                if (producerName != '') {
                  targetField = { 'Name': 'Datastore.TargetField', 'Value': producerName + '..Inferred' }
                }
                pipelineFlow.AirDescriptor.logic.push(this.buildDataStoreDeployObj(flowNode.data.customdata, targetField));
              }

              break;
            }
            case 'Data Publisher': {
              const useReading = flowNode.data.customdata.useReading;
              const useEnrichedReading = flowNode.data.customdata.useEnrichedReading;

              console.log('useReading?', flowNode);
              if (useReading) {
                pipelineFlow.AirDescriptor.logic.push(this.buildDataPublisherDeployObj(flowNode.data.customdata, null));
              }

              if (useEnrichedReading) {
                //   const targetField = { 'Name': 'MQTTPub.TargetField', 'Value': 'Inference.REST..Inferred' };
                const targetField = { 'Name': 'MQTTPub.TargetField', 'Value': lastInferenceProducer };
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
              lastInferenceProducer = flowNode.data.customdata.modelName + "..Inferred";
              pipelineFlow.AirDescriptor.logic.push(this.buildInferencingDeployObj(flowNode.data.customdata));
              if (flowNode.data.customdata.modelName) {
                producerName = flowNode.data.customdata.modelName;
              }
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
            case 'Rule Text Matching': {
              pipelineFlow.AirDescriptor.logic.push(this.buildRuleTextMatchingDeployObj(flowNode.data.customdata));
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
            case 'REST Broadcast': {
              pipelineFlow.AirDescriptor.logic.push(this.buildRESTBroadcastDeployObj(flowNode.data.customdata));
              break;
            }
            case 'MQTT Request Reply': {
              pipelineFlow.AirDescriptor.logic.push(this.buildMQTTRequestDeployObj(flowNode.data.customdata));
              break;
            }
            case 'Python': {
              pipelineFlow.AirDescriptor.logic.push(this.buildPythonDeployObj(flowNode.data.customdata));
              pipelineFlow.Artifacts = this.buildPythonDeployArtifactProperties(flowNode.data.customdata);
              break;
            }
            case 'Python Pipe': {
              pipelineFlow.AirDescriptor.logic.push(this.buildPythonPipeDeployObj(flowNode.data.customdata));
              let foundGPUs = flowNode?.data?.customdata?.context?.data?.config.filter(x => (x.key == 'use_gpu' && x.value == true))
              if (foundGPUs.length > 0) {
                useGPU = true;
              }
              pipelineFlow.Artifacts = this.artifacts
            }
          }
          pos++;

        }

      });

      if (useGPU) {
        extra.push({ "Name": "services.$Name$.deploy.resources.reservations.devices[0].capabilities[0]", "Value": "gpu" });
      }
      errorFlow.forEach(flowNode => {

        console.log('Building from : ', flowNode);
        console.log('Building: ', flowNode.name);
        // Add logic nodes
        switch (flowNode.name) {
          case 'Error Handler': {
            pipelineFlow.AirDescriptor.logic.push(this.buildErrorHandlerDeployObj(flowNode.data.customdata));
            break;
          }
          case 'REST Broadcast': {
            pipelineFlow.AirDescriptor.logic.push(this.buildRESTBroadcastDeployObj(flowNode.data.customdata));
            break;
          }
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

      console.log('Pipeline flow to be build: ', pipelineFlow);
      console.log('Pipeline flow to be build string: ', JSON.stringify(pipelineFlow));

    }
    catch (e) {
      console.log('Error: ', e);

      pipelineFlow = null;
    }
    return pipelineFlow;
  }

  deployPipeline() {

    const pipelineId = this.pipelineData.uid;
    const pipelineFlow = this.buildPipelineRequest(pipelineId.toString());

    if (pipelineFlow != null) {
      this.flogoDeployService.deployF1(pipelineId.toString(), pipelineFlow)
        .subscribe(res => {
          console.log('Received Deployment response: ', res);

          this.pipelineData.status = 'Deployed'

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
    const pipelineId = this.pipelineData.uid;
    const deployType = this.pipelineData.pipelineType;
    const deployerType = this.pipelineData.deployerType;

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

    this.flogoDeployService.undeployF1(pipelineId.toString(), pipelineFlow)
      .subscribe(res => {
        console.log('Received Undeploy response: ', res);
        this.pipelineData.status = 'Saved',
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

  updatePipelineToGraph(showSnackbar: boolean) {

    const editorData = this.editor.toJSON();
    // Update pipeline
    const pipeline = this.pipelineData;
    const tsms = Date.now();
    pipeline.modified = tsms;
    pipeline.flowConfiguration = encodeURIComponent(JSON.stringify(editorData));

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
   * Get Gateway, Pipelines and Devices information
   */
  getGatewayAndPipelines(gatewayId: string, selectedPipeline: Pipeline, updateEditor: boolean) {
    console.log('Getting gateway and pipelines for: ', gatewayId);

    this.graphService.getGatewayAndPipelines(gatewayId)
      .subscribe(res => {
        console.log('Received response for graphService.getGatewayAndPipelines: ', res);
        this.gateway = res[0] as Gateway;
        if (res[0]?.pipelines != undefined) {

          console.log('Setting pipelineDataSource.data fo incoming pipeline');
          
          // this.pipelinesDataSource.data = res[0].pipelines as Pipeline[];
          this.pipelineDataSource = res[0].pipelines as Pipeline[];
          console.log('PIPELINE DATA', this.pipelineDataSource)

          // Select last selectedPipeline
          if (selectedPipeline != null) {
            for (let i = 0; i < this.pipelineDataSource.length; i++) {
              if (this.pipelineDataSource[i].name == selectedPipeline.name) {
                this.onPipelineClicked(this.pipelineDataSource[i], updateEditor);
              }
            }
          }

        }
        else {

          // this.pipelineDataSource = new MatTableDataSource<Pipeline>();
          this.pipelineDataSource = [];

          console.log('Setting pipelineDataSource.data to null');
        }

      });
  }

  /**
   * Get Gateway, Pipelines and Devices information
   */
  getGatewayDetails(gatewayId: string) {
    console.log('Getting gateway and pipelines for: ', gatewayId);

    this.graphService.getGatewayAndPipelines(gatewayId)
      .subscribe(res => {
        console.log('Received response for graphService.getGatewayAndPipelines: ', res);
        this.gateway = res[0] as Gateway;

        if (res[0].pipelines != undefined) {

          console.log('Setting pipelineDataSource.data fo incoming pipeline');

          this.pipelineDataSource = res[0].pipelines as Pipeline[];
          console.log('PIPELINE DATA', this.pipelineDataSource)
          console.log('Got Pipelines on pilpelinesDataSource.data: ' + this.pipelineDataSource.toString());
        }
        else {

          // this.pipelinesDataSource = new MatTableDataSource<Pipeline>();
          this.pipelineDataSource = [];

          console.log('Setting pipelineDataSource.data to null');
        }

        // Get Devices to be used for filtering
        this.getDevices(this.gateway);

        // Get Models to be used for inferencing
        this.getModels(gatewayId);

      });
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

  getSubscriptionTopic(): string {

    let subscriptionTopic = '';

    const flow = this.editor.toJSON();
    const orderedFlow = this.reorderFlow('Data Subscriber', this.editor.toJSON());

    console.log('Ordered flow: ', orderedFlow);

    orderedFlow.forEach(flowNode => {
      console.log('Inspecting from node: ', flowNode);
      console.log('Inspecting from node name: ', flowNode.name);

      if (flowNode.name == 'Data Subscriber') {
        subscriptionTopic = flowNode.data.customdata.topic;
      }
    });


    return subscriptionTopic;

  }

  savePipelineToGraph() {
    const editorData = this.editor.toJSON();

    const pipelineName = this.pipelineData.name;
    const pipelineId = this.pipelineData.uid;
    const pipelineType = this.pipelineData.pipelineType;
    const deployerType = this.pipelineData.deployerType;
    if (pipelineName == '' || pipelineType == '') {
      this._snackBar.open('Failure', 'Pipeline needs a name and type', {
        duration: 3000,
      });
    }
    else if (pipelineId.toString() != '') {
      this.updatePipelineToGraph(true);
    }
    else {
      console.log('Saved editor data: ', editorData);

      // Save pipeline
      const pipeline = this.pipelineData;
      const tsms = Date.now();
      pipeline.created = tsms;
      pipeline.modified = tsms;
      pipeline.status = 'Saved';
      pipeline.flowConfiguration = encodeURIComponent(JSON.stringify(editorData));
      pipeline.subscriptionTopic = this.getSubscriptionTopic();

      // Add pipeline to graph
      this.graphService.addPipeline(this.gateway.uid, pipeline)
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

  /**
     * deletePipelineFromGraph
     */
  deletePipelineFromGraph() {
    console.log('Deleting pipeline: ', this.pipelineData);

    if (this.pipelineSelection.hasValue()) {

      this.pipelineSelected = false;
      this.deployDisabled = true;
      this.undeployDisabled = true;

      const pipeline = this.pipelineSelection.selected[0];

      // if (pipeline.status != "Undeployed") {
      //   this.undeploySelectedDataPipeline();
      // }
      this.pipelineSelection.clear();

      this.graphService.deletePipeline(this.gateway.uid, pipeline.uid)
        .subscribe(res => {
          console.log('Result from delete pipeline', res);

          this.getGatewayAndPipelines(this.gatewayId, null, true);

          // Clear the editor
          this.pipelineChange.next({ type: 'clearForm' });

          // this.resetPipelineForm();
          this.editor.clear();
        });
    }
    else {
      console.log('No selection to delete');

    }
  }

  reorderFlow(startNodeName: string, flow: any): any {
    console.log('Reordering flow starting at: ', startNodeName);
    const orderedFlow = [];

    function findStartFlowNode(startNodeName: string): any {

      let node = null;

      const keys = Object.keys(flow.nodes);

      for (let i = 0; i < keys.length; i++) {
        console.log('This is key :', keys[i]);

        const currentNode = flow.nodes[keys[i]];
        const nodeInputKeys = Object.keys(currentNode.inputs);

        console.log('Inputs for current node: ', currentNode.inputs);
        console.log('Inputs keys for current node: ', nodeInputKeys);
        // if (currentNode.name == "Data Subscriber") {
        if (nodeInputKeys.length == 0 && currentNode.name == startNodeName) {
          node = flow.nodes[keys[i]];
          break;
        }
      }

      return node;
    }

    // this function does not properly find the next nodes.
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

    const startFlowNode = findStartFlowNode(startNodeName);

    // Check to see if starter activity was found
    if (startFlowNode != null) {
      orderedFlow.push(startFlowNode);

      console.log('Ordered flow after getting start: ', orderedFlow);


      findNextNodes(startFlowNode);

      console.log('Final Ordered flow: ', orderedFlow);
    }

    return orderedFlow;

  }

  printPipeline() {
    const flowData = this.editor.toJSON();

    console.log('Editor Flow Data: ', flowData);

    console.log('Ordered pipeline flow: ', this.reorderFlow("Data Subscriber", flowData));

    console.log('Error pipeline flow: ', this.reorderFlow("Error Handler", flowData));
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
      this.pipelineData = row;

      // Clear previous selection and editor
      if (currentPipelineSelected != null) {
        console.log('Not Skipping as same row is not selected currentselection uid', currentPipelineSelected.uid);
        this.pipelineSelection.clear();
        this.pipelineChange.next({ type: 'clearForm' })
        this.editor.clear();
      }

      this.pipelineSelection.select(row);
      this.pipelineSelected = true;

      // Update pipeline form
      this.pipelineChange.next({ type: 'updatePipelineForm', pipeline: row })

      if (updateEditor) {
        // Reset the editor
        const decodedData = decodeURIComponent(row.flowConfiguration);
        const jsonData = JSON.parse(decodedData);
        this.editor.fromJSON(jsonData);
        this.filters = [];
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

  buildDataSubscriberDeployObj(contextObj): any {

    let sourceType = '';
    // Events coming from Edgex MQTT (includes envelope for payload)
    if (contextObj.topic != 'zmqedgexevents') {
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

      const encpass = 'SECRET:' + btoa(contextObj.mqtt.password);

      protocolObj = [
        { 'Name': 'Data.Gateway', 'Value': this.gatewayId },
        { 'Name': 'MQTTTrigger.Topic', 'Value': contextObj.mqtt.topic },
        { 'Name': 'MQTTTrigger.MaximumQOS', 'Value': contextObj.mqtt.maximumQOS },
        { 'Name': 'Mqtt.IoTMQTT.Broker_URL', 'Value': 'tcp://' + contextObj.mqtt.hostname + ':' + contextObj.mqtt.port },
        { 'Name': 'Mqtt.IoTMQTT.Username', 'Value': contextObj.mqtt.username },
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
        { 'Name': 'MQTTPub.Topic', 'Value': contextObj.mqtt.topic },
        { 'Name': 'MQTTPub.MaximumQOS', 'Value': contextObj.mqtt.maximumQOS },
        { 'Name': 'Mqtt.IoTMQTT.Broker_URL', 'Value': 'tcp://' + contextObj.mqtt.hostname + ':' + contextObj.mqtt.port },
        { 'Name': 'Mqtt.IoTMQTT.Username', 'Value': contextObj.mqtt.username },
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
        { 'Name': 'AMQP.url', 'Value': 'amqp://' + contextObj.amqp.username + ':' + contextObj.amqp.password + '@' + contextObj.amqp.hostname + ':' + contextObj.amqp.port + '/' },
        { 'Name': 'AMQP.exchangeName', 'Value': contextObj.amqp.exchangeName },
        { 'Name': 'AMQP.exchangeType', 'Value': contextObj.amqp.exchangeType },
        { 'Name': 'AMQP.routingKey', 'Value': contextObj.amqp.routingKey },
        { 'Name': 'AMQP.reliable', 'Value': contextObj.amqp.reliable }
      ];
    }

    console.log('>>> Build protocol properties: ', contextObj);
    console.log('>>> Build protocol properties: ', protocolObj);


    return protocolObj;

  }

  buildDataStoreDeployObj(contextObj, targetField, producerName?: string): any {
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
        { 'Name': 'PostgreSQL.IoTPostgres.Host', 'Value': contextObj.postgres.host },
        { 'Name': 'PostgreSQL.IoTPostgres.Port', 'Value': contextObj.postgres.port.toString() },
        { 'Name': 'PostgreSQL.IoTPostgres.Database_Name', 'Value': contextObj.postgres.databaseName },
        { 'Name': 'PostgreSQL.IoTPostgres.User', 'Value': contextObj.postgres.user },
        { 'Name': 'PostgreSQL.IoTPostgres.Password', 'Value': contextObj.postgres.password },
        { 'Name': 'Logging.LogLevel', 'Value': contextObj.logLevel }
      ];
    }
    else if (contextObj.dataStore == 'Snowflake') {

      dataStoreObj = [
        { 'Name': '', 'Value': contextObj.snowflake.accountName },
        { 'Name': '', 'Value': contextObj.snowflake.accountName },
        { 'Name': '', 'Value': contextObj.snowflake.database },
        { 'Name': '', 'Value': contextObj.snowflake.schema },
        { 'Name': '', 'Value': contextObj.snowflake.authType },
        { 'Name': '', 'Value': contextObj.snowflake.username },
        { 'Name': '', 'Value': contextObj.snowflake.password },
        { 'Name': '', 'Value': contextObj.snowflake.clientId },
        { 'Name': '', 'Value': contextObj.snowflake.clientSecret },
        { 'Name': '', 'Value': contextObj.snowflake.authorizationCode },
        { 'Name': '', 'Value': contextObj.snowflake.redirectURI },
        { 'Name': '', 'Value': contextObj.snowflake.loginTimeout }
      ];
    }
    else if (contextObj.dataStore == 'TGDB') {

      dataStoreObj = [
        { 'Name': 'GraphBuilder_TGDB.IoTTGDB.TGDB_Server_URL', 'Value': contextObj.tgdb.url },
        { 'Name': 'GraphBuilder_TGDB.IoTTGDB.Username', 'Value': contextObj.tgdb.username },
        { 'Name': 'GraphBuilder_TGDB.IoTTGDB.Password', 'Value': contextObj.tgdb.password }
      ];
    }
    else if (contextObj.dataStore = 'Dgraph') {

      dataStoreObj = [
        { 'Name': 'GraphBuilder_dgraph.IoTDgraph.Dgraph_Server_URL', 'Value': contextObj.dgraph.url },
        { 'Name': 'GraphBuilder_dgraph.IoTDgraph.Username', 'Value': contextObj.dgraph.username },
        { 'Name': 'GraphBuilder_dgraph.IoTDgraph.Password', 'Value': contextObj.dgraph.password }
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
      { 'Name': 'REST.Producer', 'Value': contextObj.name },
      { 'Name': 'REST.InferenceData', 'Value': inferenceData },
      { 'Name': 'REST.Conditions', 'Value': JSON.stringify(contextObj.filters) },
      { 'Name': 'REST.URLMapping', 'Value': JSON.stringify(urlMapping) },
      { 'Name': 'REST.HTTPHeaders', 'Value': JSON.stringify(contextObj.headers) },
      { 'Name': 'REST.BinaryRequestBody', 'Value': contextObj.base64Encoded }
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

    const tsms = Date.now();
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
      'created': tsms,
      'description': contextObj.description,
      'modified': tsms,
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

  buildRuleTextMatchingDeployObj(contextObj): any {

    console.log('Rule Text Matching Context: ', contextObj);

    const ruleType = 'Rule.TextMatching';
    const ruleObj = {
      name: ruleType,
      properties: this.buildRuleTextMatchingDeployProperties(contextObj)
    };

    return ruleObj;

  }

  /**
   * @param contextObj
   */
  buildRuleTextMatchingDeployProperties(contextObj): any {

    const ruleMatchingExpression = [
      {
        type: contextObj.compareOp,
        value: contextObj.compareToValue,
      }
    ];

    const ruleObj = [
      { 'Name': 'Logging.LogLevel', 'Value': contextObj.logLevel },
      { 'Name': 'Rule.TargetField', 'Value': contextObj.compareTarget },
      { 'Name': 'Rule.Matching', 'Value': JSON.stringify(ruleMatchingExpression) },
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

  buildRESTBroadcastDeployObj(contextObj): any {

    const restServiceType = 'Pipe.REST';
    const restServiceObj = {
      name: restServiceType,
      properties: this.buildRESTBroadcastDeployProperties(contextObj)
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
      { 'Name': 'REST.URLMapping', 'Value': JSON.stringify(urlMapping) },
      { 'Name': 'REST.HTTPHeaders', 'Value': JSON.stringify(contextObj.headers) }
    ];

    return propertiesObj;
  }

  buildRESTBroadcastDeployProperties(contextObj) {

    const propertiesObj = [
      { 'Name': 'Logging.LogLevel', 'Value': contextObj.logLevel },
      { 'Name': 'REST.Timeout', 'Value': contextObj.restTimeout },
      { 'Name': 'REST.URLs', 'Value': JSON.stringify(contextObj.restURLs) },
      { 'Name': 'REST.Methods', 'Value': JSON.stringify(contextObj.restMethods) },
      { 'Name': 'REST.Bodies', 'Value': JSON.stringify(contextObj.restBodies) },
      { 'Name': 'REST.HTTPHeaders', 'Value': JSON.stringify(contextObj.headers) }
    ];

    return propertiesObj
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

  buildMQTTRequestDeployObj(context): any {
    const requestReplyObj = {
      name: 'Coupler.MQTT',
      properties: this.buildMQTTRequestReplyDeployProperties(context)
    };

    return requestReplyObj;
  }

  buildMQTTRequestReplyDeployProperties(contextObj): any {
    let mqttRequestReplyDeployProperties = null;

    const encpass = 'SECRET:' + btoa(contextObj.password);

    mqttRequestReplyDeployProperties = [
      { 'Name': 'MQTTCoupler.Topic', 'Value': contextObj.topic },
      { 'Name': 'MQTTCoupler.MaximumQOS', 'Value': contextObj.maximumQOS },
      { 'Name': 'MQTTCoupler.Producer', 'Value': contextObj.producer },
      { 'Name': 'Mqtt.IoTMQTT.Broker_URL', 'Value': 'tcp://' + contextObj.hostname + ':' + contextObj.port },
      { 'Name': 'Mqtt.IoTMQTT.Username', 'Value': contextObj.username },
      { 'Name': 'Mqtt.IoTMQTT.Password', 'Value': encpass },
      { 'Name': 'Logging.LogLevel', 'Value': contextObj.logLevel },
      { 'Name': 'MQTTCoupler.ResponseTimeout', 'Value': contextObj.timeout },
      { 'Name': 'MQTTCoupler.PublishData', 'Value': contextObj.dataTemplate }
    ];
    return mqttRequestReplyDeployProperties

  }

  buildErrorHandlerDeployObj(contextObj): any {

    let sourceType = 'Error.Default';

    const sourceObj = {
      name: sourceType,
      properties: this.buildErrorHandlerDeployProperties()
    };

    return sourceObj;
  }

  buildErrorHandlerDeployProperties(): any {

    const propertiesObj = [
      { 'Name': 'Logging.LogLevel', 'Value': 'INFO' }
    ];

    return propertiesObj;
  }

  buildPythonDeployObj(context): any {
    const pythonDeployObj = {
      name: 'Processor.PythonService',
      properties: this.buildPythonDeployProperties(context)
    };

    return pythonDeployObj;
  }

  buildPythonDeployArtifactProperties(contextObj): any {
    let pythonDeployProperties = null;
    pythonDeployProperties = [
      {
        'Type': 'file',
        'Name': contextObj.processor + (contextObj.processor.includes('.py') ? '' : '.py'),
        'Value': atob(contextObj.processorContent),
        'Encoded': false
      },
      {
        'Type': 'file',
        'Name': contextObj.requirement + (contextObj.requirement.includes('.txt') ? '' : '.txt'),
        'Value': atob(contextObj.requirementContent),
        'Encoded': false
      },
    ];
    if (contextObj.dockerfile) {
      pythonDeployProperties.push({ 'Type': 'file', 'Name': 'dockerfile', 'Value': atob(contextObj.dockerfileContent), 'Encoded': false });
    }
    if (contextObj.volume) {
      pythonDeployProperties.push({ 'Type': 'folder', 'Name': contextObj.volumeName, 'Value': contextObj.volumePath });
    }
    return pythonDeployProperties
  }

  buildPythonDeployProperties(contextObj): any {
    let pythonDeployProperties = null;

    pythonDeployProperties = [
      { 'Name': 'Logging.LogLevel', 'Value': 'INFO' },
      { 'Name': 'Python.Processor', 'Value': contextObj.processor + '.py' },
      { 'Name': 'Python.Producer', 'Value': contextObj.producer },
      { 'Name': 'Python.DataIn', 'Value': contextObj.dataInput }
    ];
    return pythonDeployProperties;
  }

  buildPythonPipeDeployObj(contextObj): any {
    let pythonPipeDeloyObj = null
    pythonPipeDeloyObj = {
      name: 'Processor.PythonPipe',
      properties: this.buildPythonPipeDeployProperties(contextObj)
    }

    return pythonPipeDeloyObj;
  }

  buildPythonPipeDeployProperties(contextObj): any {
    const config = contextObj.context.data.config.reduce(
      (obj, item) => Object.assign(obj, { [item.key]: this.castItemValue(item.value) }), {});
    let pythonPipeDeployProperties = [
      { 'Name': 'Logging.LogLevel', 'Value': contextObj.logLevel },
      { 'Name': 'Python.Timeout', 'Value': contextObj.timeout },
      { 'Name': 'Python.Producer', 'Value': contextObj.name },
      {
        'Name': 'Python.Context', 'Value': {
          'name': contextObj.context.name,
          'data': {
            'input': contextObj.context.data.input,
            'output': contextObj.context.data.output,
          },
          'depends_on': contextObj.context.data.dependsOn,
          'config': config
        }
      },
      { 'Name': 'Python.DataIn', 'Value': contextObj.dataInput }
    ]

    if (contextObj?.context.data.dependsOn?.length == 0) {
      delete pythonPipeDeployProperties[3].Value.data.depends_on
    }

    pythonPipeDeployProperties[3].Value = JSON.stringify(pythonPipeDeployProperties[3].Value)

    return pythonPipeDeployProperties;
  }

  buildPythonPipeArtifacts() {
    this.graphService.getPythonResources(this.gatewayId).subscribe(resp => {
      let pythonPipeProperties = []
      resp.forEach(resource => {
        if (resource.type == 'folder') {
          if (resource.fileContent !== 'null') {
            pythonPipeProperties.push({
              'Type': 'folder',
              'Name': resource.name + (resource.name.includes('.zip') ? '' : '.zip'),
              'Value': this.isBase64(resource.fileContent) ? atob(resource.fileContent) : decodeURIComponent(resource.fileContent),
              'Encoded': true
            });
          } else {
            pythonPipeProperties.push({
              'Type': 'folder',
              'Name': resource.name,
              'Value': this.isBase64(resource.filePath) ? atob(resource.filePath) : decodeURIComponent(resource.filePath),
              'Encoded': false
            });
          }
        } else {
          let resourceToPush = {
            'Type': 'file',
            'Name': resource.name,
            'Value': this.isBase64(resource.fileContent) ? atob(resource.fileContent) : decodeURIComponent(resource.fileContent),
            'Encoded': false
          }
          switch (resource.type) {
            case 'processor': {
              resourceToPush.Name = resourceToPush.Name + (resourceToPush.Name.includes('.py') ? '' : '.py');
              break
            }
            case 'requirement': {
              resourceToPush.Name = resourceToPush.Name + (resourceToPush.Name.includes('.txt') ? '' : '.txt');
              break
            }
          }
          pythonPipeProperties.push(resourceToPush);
        }
      })
      this.artifacts = pythonPipeProperties

    })
  }

  castItemValue(value: string) {
    // number case
    if (parseInt(value)) {
      return parseFloat(value);
      // any other parsable code
    } else if (this.isJsonString(value)) {
      return JSON.parse(value);
    } else {
      return value
    }
  }

  isJsonString(str: string) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  isBase64(encodedString) {
    const regexBase64 = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
    return regexBase64.test(encodedString);   // return TRUE if its base64 string.
  }


}
