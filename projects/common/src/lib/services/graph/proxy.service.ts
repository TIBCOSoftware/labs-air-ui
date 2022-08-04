import { Injectable } from '@angular/core';
import {
  DataStore,
  DataStoreService,
  Gateway,
  GatewayService,
  RestEndpoint,
  RestEndpointsService,
  Notification,
  NotificationService,
  Pipeline,
  PipelineService,
  Protocol,
  ProtocolService,
  PythonResource,
  PythonResourceService,
  ReadingsService,
  Reading
} from '@TIBCOSoftware/labs-air-graph-client';
import { catchError, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {AppConfigService} from "common";

@Injectable()
export class ProxyService {

  /**
   *
   * @param logger
   * @param http
   */
  constructor(
    http: HttpClient,
    private appConfigService: AppConfigService,
    private dataStoreService: DataStoreService,
    private gatewayService: GatewayService,
    private modelService: RestEndpointsService,
    private notificationService: NotificationService,
    private pipelineService: PipelineService,
    private protocolService: ProtocolService,
    private readingService: ReadingsService,
    private pythonResourceService: PythonResourceService) {
    //super(http, appConfigService.getFromConfigOrEnv('dgraphUrl'), false);
    // console.log(`Constructor dGraphCloud service with url ${appConfigService.getFromConfigOrEnv('dgraphUrl')}`);
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
   * @param gatewayUuid
   */
  deleteGateway(gatewayUuid: string, account?: string): Observable<string> {
    return this.gatewayService.deleteGateway(parseInt(gatewayUuid)).pipe(
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
   * @param gatewayUuid
   * @param dataStore
   */
  addDataStore(gatewayUuid: string, dataStore: DataStore): Observable<DataStore> {
    return this.dataStoreService.addDataStore(dataStore, gatewayUuid).pipe(
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
  deleteDataStore(gatewayUuid: string, dataStoreUid: string): Observable<string> {
    return this.dataStoreService.deleteDataStore(parseInt(gatewayUuid), parseInt(dataStoreUid)).pipe(
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
   * @param gatewayUuid
   * @param protocol
   */
  addProtocol(gatewayUuid: string, protocol: Protocol): Observable<Protocol> {
    return this.protocolService.addProtocol(protocol, parseInt(gatewayUuid)).pipe(
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
   * @param gatewayUuid
   * @param protocolUid
   */
  deleteProtocol(gatewayUuid: string, protocolUid: string): Observable<string> {
    return this.protocolService.deleteProtocol(parseInt(gatewayUuid), parseInt(protocolUid)).pipe(
      catchError(this.handleError<string>('deleteProtocol'))
    );
  }

  /**
   *
   * @param gatewayName
   */
  getGatewayAndModels(gatewayName: any): Observable<Gateway[]> {
    return this.modelService.getGatewayAndRestEndpoints(gatewayName).pipe(
      catchError(this.handleError<Gateway[]>('getGatewayWithModels', []))
    );
  }

  /**
   *
   * @param gatewayName
   */
  getModels(gatewayName: any): Observable<RestEndpoint[]> {
    return this.modelService.getRestEndpoints(gatewayName).pipe(
      catchError(this.handleError<RestEndpoint[]>('getModels', []))
    );
  }

  /**
   *
   * @param gatewayUuid
   * @param model
   */
  addModel(gatewayUuid: string, model: RestEndpoint): Observable<RestEndpoint> {
    return this.modelService.addRestEndpoint(model, gatewayUuid).pipe(
      catchError(this.handleError<RestEndpoint>('addModels'))
    );
  }

  /**
   *
   * @param model
   */
  updateModel(model: RestEndpoint): Observable<RestEndpoint> {
    return this.modelService.updateRestEndpoint(model).pipe(
      catchError(this.handleError<RestEndpoint>('updateModels'))
    );
  }

  /**
   *
   * @param gatewayUuid
   * @param modelUuid
   */
  deleteModel(gatewayUuid: string, modelUuid: string): Observable<string> {
    return this.modelService.deleteRestEndpoint(gatewayUuid, modelUuid).pipe(
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
  addPipeline(gatewayUuid: string, pipeline: Pipeline): Observable<Pipeline> {
    return this.pipelineService.addPipeline(pipeline, parseInt(gatewayUuid)).pipe(
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
   * @param gatewayUuid
   * @param pipeline
   */
  deletePipeline(gatewayUuid: string, pipelineId: string): Observable<string> {
    return this.pipelineService.deletePipeline(parseInt(gatewayUuid), parseInt(pipelineId)).pipe(
      catchError(this.handleError<string>('deletePipeline'))
    );
  }

  /**
     * Get Python Resources.
     * @param gatewayUuid
     */
  getPythonResources(gatewayName: string, account?: string): Observable<PythonResource[]> {
    return this.pythonResourceService.getPythonResources(gatewayName).pipe(
      catchError(this.handleError<PythonResource[]>('getPythonResources', []))
    );
  }
  /**
   * Update Python Resource.
   * @param PythonResource
   */
  updatePythonResource(pythonResource: PythonResource, account?: string): Observable<PythonResource>{
    return this.pythonResourceService.updatePythonResource(pythonResource).pipe(
      catchError(this.handleError<PythonResource>('updatePythonResource'))
    );
  }
  /**
   * Add Python Resource.
   * @param PythonResource
   */
  addPythonResource(gatewayId: string, pythonResource: PythonResource, account?: string): Observable<PythonResource>{
    return this.pythonResourceService.addPythonResource(pythonResource, gatewayId).pipe(
      catchError(this.handleError<PythonResource>('addPythonResource'))
    );
  }
  /**
   * Delete Python Resource.
   * @param resourceUuid
   */
  deletePythonResource(pythonResourceUuid: string, account?: string): Observable<string>{
    return this.pythonResourceService.deletePythonResource(pythonResourceUuid).pipe(
      catchError(this.handleError<string>('deletePythonResource'))
    );
  }

  /**
   *
   * @param deviceName
   * @param instrumentName
   * @param numReadings
   */
  getReadings(gateway: string, deviceName: any, instrumentName: any, numReadings: any): Observable<Reading[]> {
    return this.readingService.getReadings(gateway, deviceName, instrumentName, numReadings).pipe(
      catchError(this.handleError<Reading[]>('getReadings', []))
    );
  }

  /**
   *
   * @param deviceName
   * @param instrumentName
   * @param fromts
   * @param tots
   */
  getReadingsBetween(gateway: string, deviceName: any, instrumentName: any, fromts: any, tots: any): Observable<Reading[]> {
    return this.readingService.getReadingsBetween(gateway, deviceName, instrumentName, fromts, tots).pipe(
      catchError(this.handleError<Reading[]>('getReadingsBetween', []))
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
