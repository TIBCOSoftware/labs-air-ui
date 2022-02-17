import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Gateway, Subscription, Publisher, Protocol, DataStore, Pipeline, Rule, ModelConfig, GatewayFiltersConfig, Notification, TSReading, Model } from '../../shared/models/iot.model';

@Injectable()
export abstract class GraphService {

  abstract getGateway(gatewayName:string|null): Observable<Gateway[]>;
  
  abstract getGateways(): Observable<Gateway[]>;

  abstract updateGateway(gateway: Gateway): Observable<string>;

  abstract addGateway(gateway: Gateway): Observable<string>;

  abstract deleteGateway(gatewayUid: number): Observable<string>;

  abstract getGatewayAndPublishers(gatewayName: any): Observable<Gateway[]>;

  abstract getPublishers(gatewayName: any): Observable<Publisher[]>;

  abstract addPublisher(gatewayUid: number, publisher: Publisher): Observable<string>;

  abstract updatePublisher(publisher: Publisher): Observable<string>;

  abstract deletePublisher(gatewayUid: number, publisherUid: number): Observable<string>;

  abstract getGatewayAndProtocols(gatewayName: any): Observable<Gateway[]>;

  abstract getProtocols(gatewayName: any): Observable<Protocol[]>;

  abstract addProtocol(gatewayUid: number, protocol: Protocol): Observable<string>;

  abstract updateProtocol(protocol: Protocol): Observable<string>;

  abstract deleteProtocol(gatewayUid: number, protocolUid: number): Observable<string>;

  abstract getGatewayAndDataStores(gatewayName: any): Observable<Gateway[]>;

  abstract getDataStores(gatewayName: any): Observable<DataStore[]>;

  abstract addDataStore(gatewayUid: number, dataStore: DataStore): Observable<string>;

  abstract updateDataStore(dataStore: DataStore): Observable<string>;

  abstract deleteDataStore(gatewayUid: number, dataStoreUid: number): Observable<string>;

  abstract getGatewayAndModels(gatewayName: any): Observable<Gateway[]>;

  abstract getModels(gatewayName: any): Observable<Model[]>;

  abstract addModel(gatewayUid: number, model: Model): Observable<string>;

  abstract updateModel(model: Model): Observable<string>;

  abstract deleteModel(gatewayUid: number, modelUid: number): Observable<string>;

  abstract getGatewayAndPipelines(gatewayName: any): Observable<Gateway[]>;

  abstract getPipelines(gatewayName: any): Observable<Pipeline[]>;

  abstract addPipeline(gatewayUid: number, pipeline: Pipeline, transportObj: any,
    dataStoreObj: any, filterObj: any, streamingObj: any): Observable<string>;
  
  abstract updatePipeline(pipeline: Pipeline): Observable<string>;

  abstract deletePipeline(gatewayUid: number, pipeline: Pipeline): Observable<string>;

  abstract getPipelineIdsFromProtocolUid(protocolUid: any): Observable<Pipeline[]>;

  abstract getPipelineIdsFromDataStoreUid(dataStoreUid: any): Observable<Pipeline[]>;

  abstract getRules(gatewayName: any): Observable<Rule[]>;

  abstract addRule(gatewayUid: number, rule: Rule): Observable<string>;

  abstract updateRule(rule: Rule): Observable<string>;

  abstract deleteRule(gatewayUid: number, ruleUid: number): Observable<string>;

  abstract getModelConfigs(gatewayName: any): Observable<ModelConfig[]>;

  abstract addModelConfig(gatewayUid: number, modelConfig: ModelConfig): Observable<string>;

  abstract updateModelConfig(modelConfig: ModelConfig): Observable<string>;

  abstract deleteModelConfig(gatewayUid: number, modelConfigUid: number): Observable<string>;

  abstract getFiltersConfig(gatewayName: any): Observable<GatewayFiltersConfig[]>;

  abstract addFiltersConfig(gatewayUid: number, filtersConfig: GatewayFiltersConfig): Observable<string>;

  abstract updateFiltersConfig(filtersConfig: GatewayFiltersConfig): Observable<string>;
  
  abstract getReadings(deviceName: any, instrumentName: any, numReadings: any): Observable<TSReading[]>;

  abstract getReadingsAt(deviceName: any, instrumentName: any, ts: any): Observable<TSReading[]>;

  abstract getReadingsStartingAt(deviceName: any, instrumentName: any, fromts: any): Observable<TSReading[]>;

  abstract getReadingsBetween(deviceName: any, instrumentName: any, fromts: any, tots: any): Observable<TSReading[]>;

  abstract getLastReadingsForDevice(deviceName: any): Observable<TSReading[]>;

  abstract getNotifications(): Observable<Notification[]>;

  abstract getRoute(deviceName: any): any;

  abstract getRouteCenter(deviceName: any): any;

  abstract getGatewayAndSubscriptions(gatewayName: any): Observable<Gateway[]>;
  
  abstract getSubscriptions(gatewayName: any): Observable<Subscription[]>;

  abstract addSubscription(gatewayUid: number, subscription: Subscription): Observable<string>;

  abstract updateSubscription(subscription: Subscription): Observable<string>;

  abstract deleteSubscription(gatewayUid: number, subscriptionUid: number): Observable<string>;

}
