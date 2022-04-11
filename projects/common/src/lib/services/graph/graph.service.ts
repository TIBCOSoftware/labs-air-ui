import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Gateway, Protocol, DataStore, Pipeline, ModelConfig, GatewayFiltersConfig, Notification, TSReading, Model } from '@TIBCOSoftware/labs-air-graph-service';

@Injectable()
export abstract class GraphService {

  abstract getGateway(gatewayName: string): Observable<Gateway[]>;

  abstract getGateways(): Observable<Gateway[]>;

  abstract updateGateway(gateway: Gateway): Observable<string>;

  abstract addGateway(gateway: Gateway): Observable<Gateway>;

  abstract deleteGateway(gatewayUid: number): Observable<string>;

  abstract getGatewayAndProtocols(gatewayName: string): Observable<Gateway[]>;

  abstract getProtocols(gatewayName: string): Observable<Protocol[]>;

  abstract addProtocol(gatewayUid: number, protocol: Protocol): Observable<Protocol>;

  abstract updateProtocol(protocol: Protocol): Observable<Protocol>;

  abstract deleteProtocol(gatewayUid: number, protocolUid: number): Observable<string>;

  abstract getDataStores(gatewayName: string): Observable<DataStore[]>;

  abstract addDataStore(gatewayUid: number, dataStore: DataStore): Observable<DataStore>;

  abstract updateDataStore(dataStore: DataStore): Observable<DataStore>;

  abstract deleteDataStore(gatewayUid: number, dataStoreUid: number): Observable<string>;

  abstract getGatewayAndModels(gatewayName: string): Observable<Gateway[]>;

  abstract getModels(gatewayName: string): Observable<Model[]>;

  abstract addModel(gatewayUid: number, model: Model): Observable<Model>;

  abstract updateModel(model: Model): Observable<Model>;

  abstract deleteModel(gatewayUid: number, modelUid: number): Observable<string>;

  abstract getGatewayAndPipelines(gatewayName: string): Observable<Gateway[]>;

  abstract getPipelines(gatewayName: string): Observable<Pipeline[]>;

  abstract addPipeline(
    gatewayUid: number,
    pipeline: Pipeline,
    transportObj?: any,
    dataStoreObj?: any,
    filterObj?: any,
    streamingObj?: any
  ): Observable<Pipeline>;

  abstract updatePipeline(pipeline: Pipeline): Observable<Pipeline>;

  abstract deletePipeline(gatewayUid: number, pipeline: Pipeline): Observable<string>;

  abstract getPipelineIdsFromProtocolUid(protocolUid: number): Observable<Pipeline[]>;

  abstract getPipelineIdsFromDataStoreUid(dataStoreUid: number): Observable<Pipeline[]>;

  abstract getModelConfigs(gatewayName: string): Observable<ModelConfig[]>;

  abstract addModelConfig(gatewayUid: number, modelConfig: ModelConfig): Observable<ModelConfig>;

  abstract updateModelConfig(modelConfig: ModelConfig): Observable<ModelConfig>;

  abstract deleteModelConfig(gatewayUid: number, modelConfigUid: number): Observable<string>;

  abstract getFiltersConfig(gatewayName: string): Observable<GatewayFiltersConfig[]>;

  abstract addFiltersConfig(
    gatewayUid: number,
    filtersConfig: GatewayFiltersConfig
  ): Observable<GatewayFiltersConfig>;

  abstract updateFiltersConfig(filtersConfig: GatewayFiltersConfig): Observable<GatewayFiltersConfig>;

  abstract getReadings(deviceName: string, instrumentName: string, numReadings: number): Observable<TSReading[]>;

  abstract getReadingsAt(deviceName: string, instrumentName: string, ts: number): Observable<TSReading[]>;

  abstract getReadingsStartingAt(
    deviceName: string,
    instrumentName: string,
    fromts: number
  ): Observable<TSReading[]>;

  abstract getReadingsBetween(
    deviceName: string,
    instrumentName: string,
    fromts: number,
    tots: number
  ): Observable<TSReading[]>;

  abstract getLastReadingsForDevice(deviceName: string): Observable<TSReading[]>;

  abstract getNotifications(): Observable<Notification[]>;

  abstract getRoute(deviceName: string): Observable<number[]>;

  abstract getRouteCenter(deviceName: string): Observable<number[]>;

}
