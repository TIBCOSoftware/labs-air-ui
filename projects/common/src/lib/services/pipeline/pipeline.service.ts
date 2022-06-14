import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { FlogoDeployService } from '../../services/deployment/flogo-deploy.service';
import { EdgeService } from '../../services/edge/edge.service';

import { Gateway, GraphService, Model, Pipeline } from '@TIBCOSoftware/labs-air-graph-client';

import { NodeEditor } from 'rete';

import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { Device } from '../../models/iot.model';
import { SelectionModel } from '@angular/cdk/collections';


@Injectable({
  providedIn: 'root'
})

export class PipelineService {
  buildNotificationRuleDeployObj: any;

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
  pipelineSelection = new SelectionModel<Pipeline>(false, []);

  pipelinesDataSource = new MatTableDataSource<Pipeline>();

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
    // pipeline data should not be a form.
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
              let foundGPUs = flowNode.data.customdata.config.filter(x => (x.key == 'use_gpu' && x.value == true))
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
  buildErrorHandlerDeployObj(customdata: any): any {
    throw new Error('Method not implemented.');
  }
  buildPythonPipeDeployObj(customdata: any): any {
    throw new Error('Method not implemented.');
  }
  buildPythonDeployArtifactProperties(customdata: any): any[] {
    throw new Error('Method not implemented.');
  }
  buildPythonDeployObj(customdata: any): any {
    throw new Error('Method not implemented.');
  }
  buildMQTTRequestDeployObj(customdata: any): any {
    throw new Error('Method not implemented.');
  }
  buildRESTBroadcastDeployObj(customdata: any): any {
    throw new Error('Method not implemented.');
  }
  buildRESTServiceDeployObj(customdata: any): any {
    throw new Error('Method not implemented.');
  }
  buildFlogoFlowDeployObj(customdata: any): any {
    throw new Error('Method not implemented.');
  }
  buildRuleTextMatchingDeployObj(customdata: any): any {
    throw new Error('Method not implemented.');
  }
  buildRuleExpressionDeployObj(customdata: any): any {
    throw new Error('Method not implemented.');
  }
  buildRulesDeployObj(customdata: any): any {
    throw new Error('Method not implemented.');
  }
  buildStreamingDeployObj(customdata: any): any {
    throw new Error('Method not implemented.');
  }
  buildInferencingDeployObj(customdata: any): any {
    throw new Error('Method not implemented.');
  }
  buildFiltersDeployObj(customdata: any): any {
    throw new Error('Method not implemented.');
  }
  buildCustomPublisherDeployObj(customdata: any): any {
    throw new Error('Method not implemented.');
  }
  buildDataPublisherDeployObj(customdata: any, arg1: any): any {
    throw new Error('Method not implemented.');
  }
  buildDataStoreDeployObj(customdata: any, arg1: any): any {
    throw new Error('Method not implemented.');
  }
  buildDataSubscriberDeployObj(customdata: any): {} {
    throw new Error('Method not implemented.');
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
        if (res[0].pipelines != undefined) {

          console.log('Setting pipelineDataSource.data fo incoming pipeline');


          this.pipelinesDataSource.data = res[0].pipelines as Pipeline[];

          // Select last selectedPipeline
          // if (selectedPipeline != null) {
          //   for (let i = 0; i < this.pipelinesDataSource.data.length; i++) {
          //     if (this.pipelinesDataSource.data[i].name == selectedPipeline.name) {
          //       this.onPipelineClicked(this.pipelinesDataSource.data[i], updateEditor);
          //     }
          //   }
          // }

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

          this.getGatewayAndPipelines(this.gateway.uid.toString(), pipeline, false);

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

      this.graphService.deletePipeline(this.gateway.uid, pipeline)
        .subscribe(res => {
          console.log('Result from delete pipeline', res);

          this.getGatewayAndPipelines(this.gateway.uid.toString(), null, true);

          // Clear the editor
          // this.clearPipeline();

          // this.resetPipelineForm();
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

}
