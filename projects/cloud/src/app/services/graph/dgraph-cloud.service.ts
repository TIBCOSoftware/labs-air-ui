import { Injectable } from '@angular/core';
import { GraphService } from '@TIBCOSoftware/labs-air-graph-client';
import {
  DataStore,
  DataStoreService,
  FilterConfigService,
  Gateway,
  GatewayFiltersConfig,
  GatewayService,
  Model,
  ModelConfig,
  ModelConfigService,
  ModelService,
  Notification,
  NotificationService,
  Pipeline,
  PipelineService,
  Protocol,
  ProtocolService,
  ReadingService,
  RouteService,
  TSReading
} from '@TIBCOSoftware/labs-air-graph-client';
import { Observable } from 'rxjs';
import { AppConfigService } from 'common';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class DGraphCloudService extends GraphService {


  /**
   *
   * @param logger
   * @param http
   */
  constructor(
    http: HttpClient,
    private appConfigService: AppConfigService,
    private dataStoreService: DataStoreService,
    private filterConfigService: FilterConfigService,
    private gatewayService: GatewayService,
    private modelService: ModelService,
    private modelConfigService: ModelConfigService,
    private notificationService: NotificationService,
    private pipelineService: PipelineService,
    private protocolService: ProtocolService,
    private readingService: ReadingService,
    private routeService: RouteService) {
    super(http, appConfigService.getFromConfigOrEnv('dgraphUrl'), false);
    console.log(`Constructor dGraphCloud service with url ${appConfigService.getFromConfigOrEnv('dgraphUrl')}`);

    /* const dgraphBasicAuthEnabled = this.appConfigService.getFromConfigOrEnv('dgraphBasicAuthEnabled');
    if (dgraphBasicAuthEnabled) {
      const dgraphBasicAuth = this.appConfigService.getFromConfigOrEnv('dgraphBasicAuth');
      httpOptions.headers = httpOptions.headers.append('Authorization', dgraphBasicAuth);
      httpMutateOptions.headers = httpMutateOptions.headers.append('Authorization', dgraphBasicAuth);
    }*/
  }

  /**
   *
   */
  getGateway(gatewayName: string): Observable<Gateway[]> {
    console.log('GetGateway service called for: ', gatewayName);
    return this.gatewayService.getGateway(gatewayName);
  }

  /**
   *
   */
  getGateways(): Observable<Gateway[]> {
    console.log('GetGateways service called');
    return this.gatewayService.getGateways();
  }

  /**
   *
   * @param gateway
   */
  updateGateway(gateway: Gateway): Observable<string> {
    return this.gatewayService.updateGateway(gateway);
  }

  /**
   *
   * @param gateway
   */
  addGateway(gateway: Gateway): Observable<Gateway> {
    return this.gatewayService.addGateway(gateway);
  }

  /**
   *
   * @param gatewayUid
   */
  deleteGateway(gatewayUid: number): Observable<string> {
    return this.gatewayService.deleteGateway(gatewayUid);
  }

  /**
   *
   * @param gatewayName
   */
  getDataStores(gatewayName: any): Observable<DataStore[]> {
    return this.dataStoreService.getDataStores(gatewayName);
  }

  /**
   *
   * @param gatewayUid
   * @param dataStore
   */
  addDataStore(gatewayUid: number, dataStore: DataStore): Observable<DataStore> {
    return this.dataStoreService.addDataStore(dataStore, gatewayUid);
  }
  /**
   *
   * @param dataStore
   */
  updateDataStore(dataStore: DataStore): Observable<DataStore> {
    return this.dataStoreService.updateDataStore(dataStore);
  }

  /**
   *
   * @param gatewayUid
   * @param dataStoreUid
   */
  deleteDataStore(gatewayUid: number, dataStoreUid: number): Observable<string> {
    return this.dataStoreService.deleteDataStore(gatewayUid, dataStoreUid);
  }


  /**
   *
   * @param gatewayName
   */
  getGatewayAndProtocols(gatewayName: any): Observable<Gateway[]> {
    return this.protocolService.getGatewayAndProtocols(gatewayName);
  }

  /**
   * Get all global protocols and the protocols scoped for the gateway
   * @param gatewayName
   * @filter(gt(created, ${fromts}) AND lt(created, ${tots})) (first:-500)
   */
  getProtocols(gatewayName: any): Observable<Protocol[]> {
    return this.protocolService.getProtocols(gatewayName);
  }

  /**
   *
   * @param gatewayUid
   * @param protocol
   */
  addProtocol(gatewayUid: number, protocol: Protocol): Observable<Protocol> {
    return this.protocolService.addProtocol(protocol, gatewayUid);
  }

  /**
   *
   * @param protocol
   */
  updateProtocol(protocol: Protocol): Observable<Protocol> {
    return this.protocolService.updateProtocol(protocol);

  }

  /**
   *
   * @param gatewayUid
   * @param protocolUid
   */
  deleteProtocol(gatewayUid: number, protocolUid: number): Observable<string> {
    return this.protocolService.deleteProtocol(gatewayUid, protocolUid);
  }


  /**
   *
   * @param gatewayName
   */
  getGatewayAndModels(gatewayName: any): Observable<Gateway[]> {
    return this.modelService.getGatewayAndModels(gatewayName);
  }

  /**
   *
   * @param gatewayName
   */
  getModels(gatewayName: any): Observable<Model[]> {
    return this.modelService.getModels(gatewayName);
  }

  /**
   *
   * @param gatewayUid
   * @param model
   */
  addModel(gatewayUid: number, model: Model): Observable<Model> {
    return this.modelService.addModel(model, gatewayUid);
  }
  /**
   *
   * @param model
   */
  updateModel(model: Model): Observable<Model> {
    return this.modelService.updateModel(model);
  }

  /**
   *
   * @param gatewayUid
   * @param modelUid
   */
  deleteModel(gatewayUid: number, modelUid: number): Observable<string> {
    return this.modelService.deleteModel(gatewayUid, modelUid);
  }

  /**
   *
   * @param gatewayName
   */
  getGatewayAndPipelines(gatewayName: any): Observable<Gateway[]> {
    return this.pipelineService.getGatewayAndPipelines(gatewayName);
  }

  /**
   *
   * @param gatewayName
   */
  getPipelines(gatewayName: any): Observable<Pipeline[]> {
    return this.pipelineService.getPipelines(gatewayName);
  }

  /**
   *
   * @param gatewayUid
   * @param pipeline
   */
  addPipeline(gatewayUid: number, pipeline: Pipeline): Observable<Pipeline> {
    return this.pipelineService.addPipeline(pipeline, gatewayUid);
  }

  /**
   *
   * @param pipeline
   */
  updatePipeline(pipeline: Pipeline): Observable<Pipeline> {
    return this.pipelineService.updatePipeline(pipeline);
  }

  /**
   *
   * @param gatewayUid
   * @param pipeline
   */
  deletePipeline(gatewayUid: number, pipeline: Pipeline): Observable<string> {
    return this.pipelineService.deletePipeline(pipeline, gatewayUid);
  }

  /**
   * Get ids of all the pipelines associated with the specified protocol
   * @param protocolUid - the uid of the protocol
   */
  getPipelineIdsFromProtocolUid(protocolUid: any): Observable<Pipeline[]> {
    return this.pipelineService.getPipelineIdsFromProtocolUid(protocolUid);
  }

  /**
   * Get ids of all the pipelines associated with the specified data store
   * @param dataStoreUid - the uid of the data store
   */
  getPipelineIdsFromDataStoreUid(dataStoreUid: any): Observable<Pipeline[]> {
    return this.pipelineService.getPipelineIdsFromDataStoreUid(dataStoreUid);
  }

  /**
   *
   * @param gatewayName
   */
  getModelConfigs(gatewayName: any): Observable<ModelConfig[]> {
    return this.modelConfigService.getModelConfigs(gatewayName);
  }

  /**
   *
   * @param gatewayUid
   * @param modelConfig
   */
  addModelConfig(gatewayUid: number, modelConfig: ModelConfig): Observable<ModelConfig> {
    return this.modelConfigService.addModelConfig(modelConfig, gatewayUid);
  }

  /**
   *
   * @param modelConfig
   */
  updateModelConfig(modelConfig: ModelConfig): Observable<ModelConfig> {
    return this.modelConfigService.updateModelConfig(modelConfig);
  }

  /**
   *
   * @param gatewayUid
   * @param modelConfigUid
   */
  deleteModelConfig(gatewayUid: number, modelConfigUid: number): Observable<string> {
    return this.modelConfigService.deleteModelConfig(gatewayUid, modelConfigUid);
  }

  /**
   *
   * @param gatewayName
   */
  getFiltersConfig(gatewayName: any): Observable<GatewayFiltersConfig[]> {
    return this.filterConfigService.getFiltersConfig(gatewayName);
  }

  /**
   *
   * @param gatewayUid
   * @param filtersConfig
   */
  addFiltersConfig(gatewayUid: number, filtersConfig: GatewayFiltersConfig): Observable<GatewayFiltersConfig> {
    return this.filterConfigService.addFiltersConfig(filtersConfig, gatewayUid);
  }

  /**
   *
   * @param filtersConfig
   */
  updateFiltersConfig(filtersConfig: GatewayFiltersConfig): Observable<GatewayFiltersConfig> {
    return this.filterConfigService.updateFiltersConfig(filtersConfig);
  }

  /**
   *
   * @param deviceName
   * @param instrumentName
   * @param numReadings
   */
  getReadings(deviceName: any, instrumentName: any, numReadings: any): Observable<TSReading[]> {
    return this.readingService.getReadings(deviceName, instrumentName, numReadings);
  }

  /**
   *
   * @param deviceName
   * @param instrumentName
   * @param ts
   */
  getReadingsAt(deviceName: any, instrumentName: any, ts: any): Observable<TSReading[]> {
    return this.readingService.getReadingsAt(deviceName, instrumentName, ts);
  }

  /**
   *
   * @param deviceName
   * @param instrumentName
   * @param fromts
   */
  getReadingsStartingAt(deviceName: any, instrumentName: any, fromts: any): Observable<TSReading[]> {
    return this.readingService.getReadingsStartingAt(deviceName, instrumentName, fromts);
  }

  /**
   *
   * @param deviceName
   * @param instrumentName
   * @param fromts
   * @param tots
   */
  getReadingsBetween(deviceName: any, instrumentName: any, fromts: any, tots: any): Observable<TSReading[]> {
    return this.readingService.getReadingsBetween(deviceName, instrumentName, fromts, tots);
  }

  /**
   *
   * @param deviceName
   */
  getLastReadingsForDevice(deviceName: any): Observable<TSReading[]> {
    return this.readingService.getLastReadingsForDevice(deviceName);
  }

  /**
   *
   */
  getNotifications(): Observable<Notification[]> {
    return this.notificationService.getNotifications();
  }

  /**
   *
   * @param deviceName
   */
  getRoute(deviceName: string): any {
    return this.routeService.getRoute(deviceName);
  }

  /**
   *
   * @param deviceName
   */
  getRouteCenter(deviceName: string): any {
    return this.routeService.getRouteCenter(deviceName);
  }

}
