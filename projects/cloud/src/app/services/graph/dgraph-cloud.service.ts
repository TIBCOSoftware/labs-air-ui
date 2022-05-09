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
  PythonResource,
  PythonService,
  ReadingService,
  RouteService,
  TSReading
} from '@TIBCOSoftware/labs-air-graph-client';
import { catchError, Observable, of } from 'rxjs';
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
    private routeService: RouteService,
    private pythonService: PythonService) {
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
    return this.gatewayService.getGateway(gatewayName).pipe(
      catchError(this.handleError<Gateway[]>('getGateway', [])
      ));
  }

  /**
   *
   */
  getGateways(): Observable<Gateway[]> {
    console.log('GetGateways service called');
    return this.gatewayService.getGateways().pipe(
      catchError(this.handleError<Gateway[]>('getGateway', [])
      ));;
  }

  /**
   *
   * @param gateway
   */
  updateGateway(gateway: Gateway): Observable<string> {
    return this.gatewayService.updateGateway(gateway).pipe(
      catchError(this.handleError<string>('updateGateway'))
    );
  }

  /**
   *
   * @param gateway
   */
  addGateway(gateway: Gateway): Observable<Gateway> {
    return this.gatewayService.addGateway(gateway).pipe(
      catchError(this.handleError<Gateway>('addGateway'))
    );
  }

  /**
   *
   * @param gatewayUid
   */
  deleteGateway(gatewayUid: number): Observable<string> {
    return this.gatewayService.deleteGateway(gatewayUid).pipe(
      catchError(this.handleError<string>('deleteGateway'))
    );
  }

  /**
   *
   * @param gatewayName
   */
  getDataStores(gatewayName: any): Observable<DataStore[]> {
    return this.dataStoreService.getDataStores(gatewayName).pipe(
      catchError(this.handleError<DataStore[]>('getDataStores', []))
    );
  }

  /**
   *
   * @param gatewayUid
   * @param dataStore
   */
  addDataStore(gatewayUid: number, dataStore: DataStore): Observable<DataStore> {
    return this.dataStoreService.addDataStore(dataStore, gatewayUid).pipe(
      catchError(this.handleError<DataStore>('addDataStores'))
    );
  }

  /**
   *
   * @param dataStore
   */
  updateDataStore(dataStore: DataStore): Observable<DataStore> {
    return this.dataStoreService.updateDataStore(dataStore).pipe(
      catchError(this.handleError<DataStore>('updateDataStores'))
    );
  }

  /**
   *
   * @param gatewayUid
   * @param dataStoreUid
   */
  deleteDataStore(gatewayUid: number, dataStoreUid: number): Observable<string> {
    return this.dataStoreService.deleteDataStore(gatewayUid, dataStoreUid).pipe(
      catchError(this.handleError<string>('deleteDataStore'))
    );
  }


  /**
   *
   * @param gatewayName
   */
  getGatewayAndProtocols(gatewayName: any): Observable<Gateway[]> {
    return this.protocolService.getGatewayAndProtocols(gatewayName).pipe(
      catchError(this.handleError<Gateway[]>('getGatewayWithProtocols', []))
    );
  }

  /**
   * Get all global protocols and the protocols scoped for the gateway
   * @param gatewayName
   * @filter(gt(created, ${fromts}) AND lt(created, ${tots})) (first:-500)
   */
  getProtocols(gatewayName: any): Observable<Protocol[]> {
    return this.protocolService.getProtocols(gatewayName).pipe(
      catchError(this.handleError<Protocol[]>('getProtocols', []))
    );
  }

  /**
   *
   * @param gatewayUid
   * @param protocol
   */
  addProtocol(gatewayUid: number, protocol: Protocol): Observable<Protocol> {
    return this.protocolService.addProtocol(protocol, gatewayUid).pipe(
      catchError(this.handleError<Protocol>('addProtocols'))
    );
  }

  /**
   *
   * @param protocol
   */
  updateProtocol(protocol: Protocol): Observable<Protocol> {
    return this.protocolService.updateProtocol(protocol).pipe(
      catchError(this.handleError<Protocol>('updateProtocols'))
    );
  }

  /**
   *
   * @param gatewayUid
   * @param protocolUid
   */
  deleteProtocol(gatewayUid: number, protocolUid: number): Observable<string> {
    return this.protocolService.deleteProtocol(gatewayUid, protocolUid).pipe(
      catchError(this.handleError<string>('deleteProtocol'))
    );
  }

  /**
   *
   * @param gatewayName
   */
  getGatewayAndModels(gatewayName: any): Observable<Gateway[]> {
    return this.modelService.getGatewayAndModels(gatewayName).pipe(
      catchError(this.handleError<Gateway[]>('getGatewayWithModels', []))
    );
  }

  /**
   *
   * @param gatewayName
   */
  getModels(gatewayName: any): Observable<Model[]> {
    return this.modelService.getModels(gatewayName).pipe(
      catchError(this.handleError<Model[]>('getModels', []))
    );
  }

  /**
   *
   * @param gatewayUid
   * @param model
   */
  addModel(gatewayUid: number, model: Model): Observable<Model> {
    return this.modelService.addModel(model, gatewayUid).pipe(
      catchError(this.handleError<Model>('addModels'))
    );
  }

  /**
   *
   * @param model
   */
  updateModel(model: Model): Observable<Model> {
    return this.modelService.updateModel(model).pipe(
      catchError(this.handleError<Model>('updateModels'))
    );
  }

  /**
   *
   * @param gatewayUid
   * @param modelUid
   */
  deleteModel(gatewayUid: number, modelUid: number): Observable<string> {
    return this.modelService.deleteModel(gatewayUid, modelUid).pipe(
      catchError(this.handleError<string>('deleteModel'))
    );
  }

  /**
   *
   * @param gatewayName
   */
  getGatewayAndPipelines(gatewayName: any): Observable<Gateway[]> {
    return this.pipelineService.getGatewayAndPipelines(gatewayName).pipe(
      catchError(this.handleError<Gateway[]>('getGatewayWithPipelines', []))
    );
  }

  /**
   *
   * @param gatewayName
   */
  getPipelines(gatewayName: any): Observable<Pipeline[]> {
    return this.pipelineService.getPipelines(gatewayName).pipe(
      catchError(this.handleError<Pipeline[]>('getPipelines', []))
    );
  }

  /**
   *
   * @param gatewayUid
   * @param pipeline
   */
  addPipeline(gatewayUid: number, pipeline: Pipeline): Observable<Pipeline> {
    return this.pipelineService.addPipeline(pipeline, gatewayUid).pipe(
      catchError(this.handleError<Pipeline>('addPipelines'))
    );
  }

  /**
   *
   * @param pipeline
   */
  updatePipeline(pipeline: Pipeline): Observable<Pipeline> {
    return this.pipelineService.updatePipeline(pipeline).pipe(
      catchError(this.handleError<Pipeline>('updatePipeline'))
    );
  }

  /**
   *
   * @param gatewayUid
   * @param pipeline
   */
  deletePipeline(gatewayUid: number, pipeline: Pipeline): Observable<string> {
    return this.pipelineService.deletePipeline(pipeline, gatewayUid).pipe(
      catchError(this.handleError<string>('deletePipeline'))
    );
  }

  /**
   * Get ids of all the pipelines associated with the specified protocol
   * @param protocolUid - the uid of the protocol
   */
  getPipelineIdsFromProtocolUid(protocolUid: any): Observable<Pipeline[]> {
    return this.pipelineService.getPipelineIdsFromProtocolUid(protocolUid).pipe(
      catchError(this.handleError<Pipeline[]>('getPipelineIdsFromProtocolUid', []))
    );
  }

  /**
   * Get ids of all the pipelines associated with the specified data store
   * @param dataStoreUid - the uid of the data store
   */
  getPipelineIdsFromDataStoreUid(dataStoreUid: any): Observable<Pipeline[]> {
    return this.pipelineService.getPipelineIdsFromDataStoreUid(dataStoreUid).pipe(
      catchError(this.handleError<Pipeline[]>('getPipelineIdsFromDataStoreUid', []))
    );
  }

  /**
   *
   * @param gatewayName
   */
  getModelConfigs(gatewayName: any): Observable<ModelConfig[]> {
    return this.modelConfigService.getModelConfigs(gatewayName).pipe(
      catchError(this.handleError<ModelConfig[]>('getModelConfigs', []))
    );
  }

  /**
   *
   * @param gatewayUid
   * @param modelConfig
   */
  addModelConfig(gatewayUid: number, modelConfig: ModelConfig): Observable<ModelConfig> {
    return this.modelConfigService.addModelConfig(modelConfig, gatewayUid).pipe(
      catchError(this.handleError<ModelConfig>('addModelConfig'))
    );
  }

  /**
   *
   * @param modelConfig
   */
  updateModelConfig(modelConfig: ModelConfig): Observable<ModelConfig> {
    return this.modelConfigService.updateModelConfig(modelConfig).pipe(
      catchError(this.handleError<ModelConfig>('updateModelConfig'))
    );
  }

  /**
   *
   * @param gatewayUid
   * @param modelConfigUid
   */
  deleteModelConfig(gatewayUid: number, modelConfigUid: number): Observable<string> {
    return this.modelConfigService.deleteModelConfig(gatewayUid, modelConfigUid).pipe(
      catchError(this.handleError<string>('deleteModelConfig'))
    );
  }

  /**
   *
   * @param gatewayName
   */
  getFiltersConfig(gatewayName: any): Observable<GatewayFiltersConfig[]> {
    return this.filterConfigService.getFiltersConfig(gatewayName).pipe(
      catchError(this.handleError<GatewayFiltersConfig[]>('getFiltersConfigs', []))
    );
  }

  /**
   *
   * @param gatewayUid
   * @param filtersConfig
   */
  addFiltersConfig(gatewayUid: number, filtersConfig: GatewayFiltersConfig): Observable<GatewayFiltersConfig> {
    return this.filterConfigService.addFiltersConfig(filtersConfig, gatewayUid).pipe(
      catchError(this.handleError<GatewayFiltersConfig>('addFiltersConfig'))
    );
  }

  /**
   *
   * @param filtersConfig
   */
  updateFiltersConfig(filtersConfig: GatewayFiltersConfig): Observable<GatewayFiltersConfig> {
    return this.filterConfigService.updateFiltersConfig(filtersConfig).pipe(
      catchError(this.handleError<GatewayFiltersConfig>('updateFiltersConfig'))
    );
  }

  /**
     * Get Python Resources.
     * @param gatewayUid
     */
  getPythonResources(gatewayName: string, account?: string): Observable<PythonResource[]> {
    return this.pythonService.getPythonResources(gatewayName).pipe(
      catchError(this.handleError<PythonResource[]>('getPythonResources', []))
    );
  }
  /**
   * Update Python Resource.
   * @param PythonResource
   */
  updatePythonResource(pythonResource: PythonResource, account?: string): Observable<PythonResource>{
    return this.pythonService.updatePythonResource(pythonResource).pipe(
      catchError(this.handleError<PythonResource>('updatePythonResource'))
    );
  }
  /**
   * Add Python Resource.
   * @param PythonResource
   */
  addPythonResource(pythonResource: PythonResource, account?: string): Observable<PythonResource>{
    return this.pythonService.addPythonResource(pythonResource).pipe(
      catchError(this.handleError<PythonResource>('addPythonResource'))
    );
  }
  /**
   * Delete Python Resource.
   * @param resourceUid
   */
  deletePythonResource(pythonResourceUid: number, account?: string): Observable<string>{
    return this.pythonService.deletePythonResource(pythonResourceUid).pipe(
      catchError(this.handleError<string>('deletePythonResource'))
    );
  }

  /**
   *
   * @param deviceName
   * @param instrumentName
   * @param numReadings
   */
  getReadings(deviceName: any, instrumentName: any, numReadings: any): Observable<TSReading[]> {
    return this.readingService.getReadings(deviceName, instrumentName, numReadings).pipe(
      catchError(this.handleError<TSReading[]>('getReadings', []))
    );
  }

  /**
   *
   * @param deviceName
   * @param instrumentName
   * @param ts
   */
  getReadingsAt(deviceName: any, instrumentName: any, ts: any): Observable<TSReading[]> {
    return this.readingService.getReadingsAt(deviceName, instrumentName, ts).pipe(
      catchError(this.handleError<TSReading[]>('getReadingsAt', []))
    );
  }

  /**
   *
   * @param deviceName
   * @param instrumentName
   * @param fromts
   */
  getReadingsStartingAt(deviceName: any, instrumentName: any, fromts: any): Observable<TSReading[]> {
    return this.readingService.getReadingsStartingAt(deviceName, instrumentName, fromts).pipe(
      catchError(this.handleError<TSReading[]>('getReadingsStartingAt', []))
    );
  }

  /**
   *
   * @param deviceName
   * @param instrumentName
   * @param fromts
   * @param tots
   */
  getReadingsBetween(deviceName: any, instrumentName: any, fromts: any, tots: any): Observable<TSReading[]> {
    return this.readingService.getReadingsBetween(deviceName, instrumentName, fromts, tots).pipe(
      catchError(this.handleError<TSReading[]>('getReadingsBetween', []))
    );
  }

  /**
   *
   * @param deviceName
   */
  getLastReadingsForDevice(deviceName: any): Observable<TSReading[]> {
    return this.readingService.getLastReadingsForDevice(deviceName).pipe(
      catchError(this.handleError<TSReading[]>('getLastReadingsForDevice', []))
    );
  }

  /**
   *
   */
  getNotifications(): Observable<Notification[]> {
    return this.notificationService.getNotifications().pipe(
      catchError(this.handleError<Notification[]>('getNotifications', []))
    );
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

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result ?: T) {

  return (error: any): Observable<T> => {
    console.log('Got an error.  Handling Error for:', operation);

    // TODO: better job of transforming error for user consumption
    console.info(`${operation} failed: ${error.message}`);

    // Let the app keep running by returning an empty result.
    return of(result as T);
  };
}
}
