import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';

import {
  DataStore,
  Gateway,
  GatewayFiltersConfig,
  Model,
  ModelConfig,
  Notification,
  Pipeline,
  Protocol,
  TSReading
} from '@TIBCOSoftware/labs-air-graph-client';
import { GraphService } from '@TIBCOSoftware/labs-air-graph-client';

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

const httpMutateOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/rdf' })
};

const route1 = [
    [25.771088, -80.163483],
    [27.439775, -80.32299],
    [28.349469, -80.731105],
    [30.401564, -81.571033],
    [32.116716, -81.144147],
    [32.866511, -79.995399],
    [34.191224, -77.952419],
    [36.850172, -76.319269],
    [36.915037, -76.320643],
    [39.262025, -76.549294],
    [39.900933, -75.143453],
    [40.690263, -74.152375],
    [42.259951, -71.789244]
];

const route2 = [
    [47.492471, -122.26888],
    [45.552207, -122.722648],
    [39.53246, -119.751524],
    [37.803528, -122.312138],
    [37.899332, -121.169307],
    [36.273183, -115.070534],
    [33.77032, -118.273289],
    [34.106012, -117.320254],
    [33.515564, -112.160564],
    [32.126437, -110.848336],
    [31.752085, -106.488887],
    [35.04758, -106.653344],
    [39.796963, -104.995374]
];

const route3 = [
    [29.302729, -98.638744],
    [29.638421, -95.292245],
    [32.615525, -96.693485],
    [29.917836, -90.205272],
    [32.256403, -90.151546],
    [35.044849, -90.153006],
    [38.524627, -90.209535],
    [39.870851, -88.912284],
    [41.705694, -87.577341],
    [41.902382, -89.101932],
    [44.251243, -91.509663],
    [44.970069, -93.174527],
    [46.758181, -92.098748]
];

// TODO this does not seem to be in use.
@Injectable()
export class TgdbService { // extends GraphService {

  // Defined as a proxy.  (i.e. http://137.117.38.255:8080)
  private tgdbUrl = '/tgdb';

  constructor(private http: HttpClient) {
  }

  /**
   *
   */
  getGateway(gatewayName: string, account: string): Observable<Gateway[]> {
      console.log('GetGateway service called for: ', gatewayName);
      const url = `${this.tgdbUrl}/query`;
      const query = `{
      resp(func: has(gateway)) @filter(eq(uuid, "${gatewayName}")) {
        uid uuid description address latitude longitude accessToken createdts updatedts
      }
    }`;

      return this.http.post<any>(url, query, httpOptions)
          .pipe(
              map(response => response.data.resp as Gateway[]),
              tap(_ => console.info('fetched gateways')),
              catchError(this.handleError<Gateway[]>('getGateway', []))
          );
  }

  /**
   *
   */
  getGateways(account: string): Observable<Gateway[]> {
      console.log('GetGateways tgdb service called');
      const url = `${this.tgdbUrl}/search`;

      const query = `{
      "query": {
        "language" : "gremlin",
        "queryString": "g.V().hasLabel('gateway');"
      }
    }`;

      return this.http.post<any>(url, query, httpOptions)
          .pipe(

              tap(_ => console.log('Got response from tgdb')),
              map(response => response.queryResult.content.nodes as Gateway[]),
              tap(_ => console.info('fetched gateways')),
              catchError(this.handleError<Gateway[]>('getGateways', []))
          );
  }

  /**
   *
   * @param gateway
   */
  updateGateway(gateway: Gateway, account: string): Observable<string> {
      const url = `${this.tgdbUrl}/mutate?commitNow=true`;
      const query = `{
      set {
        <${gateway.uid}> <address> "${gateway.address}" .
        <${gateway.uid}> <description> "${gateway.description}" .
        <${gateway.uid}> <latitude> "${gateway.latitude}" .
        <${gateway.uid}> <longitude> "${gateway.longitude}" .
        <${gateway.uid}> <accessToken> "${gateway.accessToken}" .
        <${gateway.uid}> <updatedts> "${gateway.updatedts}" .
      }
    }`;
      console.log('Update Gateway Mutate statement: ', query);

      return this.http.post<any>(url, query, httpMutateOptions)
          .pipe(
              tap(_ => console.info('updated gateway')),
              catchError(this.handleError<string>('updateGateway'))
          );
  }

  /**
   *
   * @param gateway
   */
  addGateway(gateway: Gateway, account: string): Observable<Gateway> {
      const url = `${this.tgdbUrl}/mutate?commitNow=true`;
      const query = `{
      set {
        _:Gateway <dgraph.type> "Gateway" .
        _:Gateway <gateway> "" .
        _:Gateway <type> "gateway" .
        _:Gateway <uuid> "${gateway.uuid}" .
        _:Gateway <description> "${gateway.description}" .
        _:Gateway <address> "${gateway.address}" .
        _:Gateway <latitude> "${gateway.latitude}" .
        _:Gateway <longitude> "${gateway.longitude}" .
        _:Gateway <accessToken> "${gateway.accessToken}" .
        _:Gateway <createdts> "${gateway.createdts}" .
        _:Gateway <updatedts> "${gateway.updatedts}" .
      }
    }`;
      console.log('Add Gateway Mutate statement: ', query);

      return this.http.post<any>(url, query, httpMutateOptions)
          .pipe(
              tap(_ => console.info('add gateway')),
              catchError(this.handleError<Gateway>('addGateway'))
          );
  }

  /**
   *
   * @param gatewayUid
   */
  deleteGateway(gatewayUid: number, account: string): Observable<string> {
      const url = `${this.tgdbUrl}/mutate?commitNow=true`;
      const query = `{
      delete {
        <${gatewayUid}> * * .
      }
    }`;
      console.log('Delete Gateway Mutate statement: ', query);

      return this.http.post<any>(url, query, httpMutateOptions)
          .pipe(
              tap(_ => console.info('deleted gateway')),
              catchError(this.handleError<string>('deleteGateway'))
          );
  }

  /**
   *
   * @param gatewayName
   */
  getDataStores(gatewayName: any, account: string): Observable<DataStore[]> {
      const url = `${this.tgdbUrl}/query`;
      const query = `{
      var(func: has(gateway)) @filter(eq(uuid, "${gatewayName}")) {
        dataStores as gateway_datastore {
        }
      }
      resp(func: uid(dataStores)) {
        uid
        uuid
        created
        modified
        dataStoreType
        host
        port
        databaseName
        user
        password
        accountName
        warehouse
        database
        schema
        authType
        username
        clientId
        clientSecret
        authorizationCode
        redirectURI
        loginTimeout
        url
      }
    }`;

      return this.http.post<any>(url, query, httpOptions)
          .pipe(
              map(response => response.data.resp as DataStore[]),
              tap(_ => console.info('fetched dataStores')),
              catchError(this.handleError<DataStore[]>('getDataStores', []))
          );

  }

  /**
   *
   * @param gatewayUid
   * @param dataStore
   */
  addDataStore(gatewayUid: number, dataStore: DataStore, account: string): Observable<DataStore> {
      const url = `${this.tgdbUrl}/mutate?commitNow=true`;
      const query = `{
      set {
        _:DataStore <dgraph.type> "DataStore" .
        _:DataStore <type> "dataStore" .
        _:DataStore <dataStore> "" .
        _:DataStore <uuid> "${dataStore.uuid}" .
        _:DataStore <created> "${dataStore.created}" .
        _:DataStore <modified> "${dataStore.modified}" .
        _:DataStore <dataStoreType> "${dataStore.dataStoreType}" .
        _:DataStore <host> "${dataStore.host}" .
        _:DataStore <port> "${dataStore.port}" .
        _:DataStore <databaseName> "${dataStore.databaseName}" .
        _:DataStore <user> "${dataStore.user}" .
        _:DataStore <password> "${dataStore.password}" .
        _:DataStore <accountName> "${dataStore.accountName}" .
        _:DataStore <warehouse> "${dataStore.warehouse}" .
        _:DataStore <database> "${dataStore.databaseName}" .
        _:DataStore <schema> "${dataStore.schema}" .
        _:DataStore <authType> "${dataStore.authType}" .
        _:DataStore <username> "${dataStore.username}" .
        _:DataStore <clientId> "${dataStore.clientId}" .
        _:DataStore <clientSecret> "${dataStore.clientSecret}" .
        _:DataStore <authorizationCode> "${dataStore.authorizationCode}" .
        _:DataStore <redirectURI> "${dataStore.redirectURI}" .
        _:DataStore <loginTimeout> "${dataStore.loginTimeout}" .
        _:DataStore <url> "${dataStore.url}" .
        <${gatewayUid}> <gateway_datastore> _:DataStore .
      }
    }`;
      console.log('Mutate statement: ', query);

      return this.http.post<any>(url, query, httpMutateOptions)
          .pipe(
              tap(_ => console.info('add dataStores')),
              catchError(this.handleError<DataStore>('addDataStores'))
          );

  }
  /**
   *
   * @param dataStore
   */
  updateDataStore(dataStore: DataStore, account: string): Observable<DataStore> {
      const url = `${this.tgdbUrl}/mutate?commitNow=true`;
      const query = `{
      set {
        <${dataStore.uid}> <uuid> "${dataStore.uuid}" .
        <${dataStore.uid}> <modified> "${dataStore.modified}" .
        <${dataStore.uid}> <dataStoreType> "${dataStore.dataStoreType}" .
        <${dataStore.uid}> <host> "${dataStore.host}" .
        <${dataStore.uid}> <port> "${dataStore.port}" .
        <${dataStore.uid}> <databaseName> "${dataStore.databaseName}" .
        <${dataStore.uid}> <user> "${dataStore.user}" .
        <${dataStore.uid}> <password> "${dataStore.password}" .
        <${dataStore.uid}> <accountName> "${dataStore.accountName}" .
        <${dataStore.uid}> <warehouse> "${dataStore.warehouse}" .
        <${dataStore.uid}> <database> "${dataStore.databaseName}" .
        <${dataStore.uid}> <schema> "${dataStore.schema}" .
        <${dataStore.uid}> <authType> "${dataStore.authType}" .
        <${dataStore.uid}> <username> "${dataStore.username}" .
        <${dataStore.uid}> <clientId> "${dataStore.clientId}" .
        <${dataStore.uid}> <clientSecret> "${dataStore.clientSecret}" .
        <${dataStore.uid}> <authorizationCode> "${dataStore.authorizationCode}" .
        <${dataStore.uid}> <redirectURI> "${dataStore.redirectURI}" .
        <${dataStore.uid}> <loginTimeout> "${dataStore.loginTimeout}" .
        <${dataStore.uid}> <url> "${dataStore.url}" .

      }
    }`;
      console.log('Mutate statement: ', query);

      return this.http.post<any>(url, query, httpMutateOptions)
          .pipe(
              tap(_ => console.info('updated dataStores')),
            catchError(this.handleError<DataStore>('updateDataStores'))
          );

  }

  /**
   *
   * @param gatewayUid
   * @param dataStoreUid
   */
  deleteDataStore(gatewayUid: number, dataStoreUid: number, account: string): Observable<string> {
      const url = `${this.tgdbUrl}/mutate?commitNow=true`;
      const query = `{
      delete {
        <${dataStoreUid}> * * .
        <${gatewayUid}> <gateway_datastore> <${dataStoreUid}> .
      }
    }`;
      console.log('Delete DataStore Mutate statement: ', query);

      return this.http.post<any>(url, query, httpMutateOptions)
          .pipe(
              tap(_ => console.info('deleted dataStore')),
              catchError(this.handleError<string>('deleteDataStore'))
          );
  }


  /**
   *
   * @param gatewayName
   */
  getGatewayAndProtocols(gatewayName: any, account: string): Observable<Gateway[]> {
      const url = `${this.tgdbUrl}/query`;
      const query = `{
      resp(func: has(gateway)) @filter(eq(uuid, "${gatewayName}")) {
        uid uuid
        protocols: gateway_protocol {
          uid
          uuid
          created
          modified
          protocolType
          brokerURL
          topic
          consumerGroupId
          connectionTimeout
          sessionTimeout
          initialOffset
          retryBackoff
          fetchMinBytes
          fetchMaxWait
          commitInterval
          heartbeatInterval
          maximumQOS
          username
          password
          encryptionMode
          caCertificate
          clientCertificate
          clientKey
          authMode
          serverCerticate
        }
      }
    }`;
      console.log('Get Gateway and Protocols query statement: ', query);

      return this.http.post<any>(url, query, httpOptions)
          .pipe(
              map(response => response.data.resp as Gateway[]),
              tap(_ => console.info('fetched Gateway')),
              catchError(this.handleError<Gateway[]>('getGatewayWithProtocols', []))
          );

  }

  /**
   *
   * @param gatewayName
   */
  getProtocols(gatewayName: any, account: string): Observable<Protocol[]> {
      const url = `${this.tgdbUrl}/query`;
      const query = `{
      var(func: has(gateway)) @filter(eq(uuid, "${gatewayName}")) {
        protocols as gateway_protocol {
        }
      }
      resp(func: uid(protocols)) {
        uid
        uuid
        created
        modified
        protocolType
        brokerURL
        topic
        consumerGroupId
        connectionTimeout
        sessionTimeout
        initialOffset
        retryBackoff
        fetchMinBytes
        fetchMaxWait
        commitInterval
        heartbeatInterval
        maximumQOS
        username
        password
        encryptionMode
        caCertificate
        clientCertificate
        clientKey
        authMode
        serverCerticate
      }
    }`;

      return this.http.post<any>(url, query, httpOptions)
          .pipe(
              map(response => response.data.resp as Protocol[]),
              tap(_ => console.info('fetched protocols')),
              catchError(this.handleError<Protocol[]>('getProtocols', []))
          );

  }

  /**
   *
   * @param gatewayUid
   * @param protocol
   */
  addProtocol(gatewayUid: number, protocol: Protocol, account: string): Observable<Protocol> {
      const url = `${this.tgdbUrl}/mutate?commitNow=true`;
      const query = `{
      set {
        _:Protocol <dgraph.type> "Protocol" .
        _:Protocol <type> "protocol" .
        _:Protocol <protocol> "" .
        _:Protocol <uuid> "${protocol.uuid}" .
        _:Protocol <created> "${protocol.created}" .
        _:Protocol <modified> "${protocol.modified}" .
        _:Protocol <protocolType> "${protocol.protocolType}" .
        _:Protocol <brokerURL> "${protocol.brokerURL}" .
        _:Protocol <topic> "${protocol.topic}" .
        _:Protocol <consumerGroupId> "${protocol.consumerGroupId}" .
        _:Protocol <connectionTimeout> "${protocol.connectionTimeout}" .
        _:Protocol <sessionTimeout> "${protocol.sessionTimeout}" .
        _:Protocol <initialOffset> "${protocol.initialOffset}" .
        _:Protocol <retryBackoff> "${protocol.retryBackOff}" .
        _:Protocol <fetchMinBytes> "${protocol.fetchMinBytes}" .
        _:Protocol <fetchMaxWait> "${protocol.fetchMaxWait}" .
        _:Protocol <commitInterval > "${protocol.commitInterval}" .
        _:Protocol <heartbeatInterval> "${protocol.heartbeatInterval}" .
        _:Protocol <maximumQOS> "${protocol.maximumQOS}" .
        _:Protocol <username> "${protocol.username}" .
        _:Protocol <password> "${protocol.password}" .
        _:Protocol <encryptionMode> "${protocol.encryptionMode}" .
        _:Protocol <caCertificate> "${protocol.caCertificate}" .
        _:Protocol <clientCertificate> "${protocol.clientCertificate}" .
        _:Protocol <clientKey> "${protocol.clientKey}" .
        _:Protocol <authMode> "${protocol.authMode}" .
        _:Protocol <serverCerticate> "${protocol.serverCertificate}" .
        <${gatewayUid}> <gateway_protocol> _:Protocol .
      }
    }`;
      console.log('Mutate statement: ', query);

      return this.http.post<any>(url, query, httpMutateOptions)
          .pipe(
              tap(_ => console.info('add protocols')),
            catchError(this.handleError<Protocol>('addProtocols'))
          );

  }
  /**
   *
   * @param protocol
   */
  updateProtocol(protocol: Protocol, account: string): Observable<Protocol> {
      const url = `${this.tgdbUrl}/mutate?commitNow=true`;
      const query = `{
      set {
        _:Protocol <uuid> "${protocol.uuid}" .
        _:Protocol <modified> "${protocol.modified}" .
        _:Protocol <protocolType> "${protocol.protocolType}" .
        _:Protocol <brokerURL> "${protocol.brokerURL}" .
        _:Protocol <topic> "${protocol.topic}" .
        _:Protocol <consumerGroupId> "${protocol.consumerGroupId}" .
        _:Protocol <connectionTimeout> "${protocol.connectionTimeout}" .
        _:Protocol <sessionTimeout> "${protocol.sessionTimeout}" .
        _:Protocol <initialOffset> "${protocol.initialOffset}" .
        _:Protocol <retryBackoff> "${protocol.retryBackOff}" .
        _:Protocol <fetchMinBytes> "${protocol.fetchMinBytes}" .
        _:Protocol <fetchMaxWait> "${protocol.fetchMaxWait}" .
        _:Protocol <commitInterval > "${protocol.commitInterval}" .
        _:Protocol <heartbeatInterval> "${protocol.heartbeatInterval}" .
        _:Protocol <maximumQOS> "${protocol.maximumQOS}" .
        _:Protocol <username> "${protocol.username}" .
        _:Protocol <password> "${protocol.password}" .
        _:Protocol <encryptionMode> "${protocol.encryptionMode}" .
        _:Protocol <caCertificate> "${protocol.caCertificate}" .
        _:Protocol <clientCertificate> "${protocol.clientCertificate}" .
        _:Protocol <clientKey> "${protocol.clientKey}" .
        _:Protocol <authMode> "${protocol.authMode}" .
        _:Protocol <serverCerticate> "${protocol.serverCertificate}" .
      }
    }`;
      console.log('Mutate statement: ', query);

      return this.http.post<any>(url, query, httpMutateOptions)
          .pipe(
              tap(_ => console.info('updated protocols')),
            catchError(this.handleError<Protocol>('updateProtocols'))
          );

  }

  /**
   *
   * @param gatewayUid
   * @param protocolUid
   */
  deleteProtocol(gatewayUid: number, protocolUid: number, account: string): Observable<string> {
      const url = `${this.tgdbUrl}/mutate?commitNow=true`;
      const query = `{
      delete {
        <${protocolUid}> * * .
        <${gatewayUid}> <gateway_protocol> <${protocolUid}> .
      }
    }`;
      console.log('Delete Protocol Mutate statement: ', query);

      return this.http.post<any>(url, query, httpMutateOptions)
          .pipe(
              tap(_ => console.info('deleted protocol')),
              catchError(this.handleError<string>('deleteProtocol'))
          );
  }


  /**
   *
   * @param gatewayName
   */
  getGatewayAndModels(gatewayName: any, account: string): Observable<Gateway[]> {
      const url = `${this.tgdbUrl}/query`;
      const query = `{
      resp(func: has(gateway)) @filter(eq(uuid, "${gatewayName}")) {
        uid uuid
        models: gateway_model {
          uid
          uuid
          created
          name
          description
          inputType
          url
        }
      }
    }`;
      console.log('Get Gateway and Protocols query statement: ', query);

      return this.http.post<any>(url, query, httpOptions)
          .pipe(
              map(response => response.data.resp as Gateway[]),
              tap(_ => console.info('fetched Gateway')),
              catchError(this.handleError<Gateway[]>('getGatewayWithModels', []))
          );

  }

  /**
   *
   * @param gatewayName
   */
  getModels(gatewayName: any, account: string): Observable<Model[]> {
      const url = `${this.tgdbUrl}/query`;
      const query = `{
      var(func: has(gateway)) @filter(eq(uuid, "${gatewayName}")) {
        models as gateway_model {
        }
      }
      resp(func: uid(models)) {
        uid
        uuid
        created
        modified
        name
        description
        inputType
        url
      }
    }`;

      return this.http.post<any>(url, query, httpOptions)
          .pipe(
              map(response => response.data.resp as Model[]),
              tap(_ => console.info('fetched models')),
              catchError(this.handleError<Model[]>('getModels', []))
          );

  }

  /**
   *
   * @param gatewayUid
   * @param model
   */
  addModel(gatewayUid: number, model: Model, account: string): Observable<Model> {
      const url = `${this.tgdbUrl}/mutate?commitNow=true`;
      const query = `{
      set {
        _:Model <dgraph.type> "Model" .
        _:Model <type> "model" .
        _:Model <model> "" .
        _:Model <uuid> "${model.uuid}" .
        _:Model <created> "${model.created}" .
        _:Model <modified> "${model.modified}" .
        _:Model <name> "${model.name}" .
        _:Model <description> "${model.description}" .
        _:Model <inputType> "${model.inputType}" .
        _:Model <url> "${model.url}" .
        <${gatewayUid}> <gateway_model> _:Model .
      }
    }`;
      console.log('Mutate statement: ', query);

      return this.http.post<any>(url, query, httpMutateOptions)
          .pipe(
              tap(_ => console.info('add models')),
            catchError(this.handleError<Model>('addModels'))
          );

  }
  /**
   *
   * @param model
   */
  updateModel(model: Model, account: string): Observable<Model> {
      const url = `${this.tgdbUrl}/mutate?commitNow=true`;
      const query = `{
      set {
        <${model.uid}> <uuid> "${model.uuid}" .
        <${model.uid}> <modified> "${model.modified}" .
        <${model.uid}> <name> "${model.name}" .
        <${model.uid}> <description> "${model.description}" .
        <${model.uid}> <inputType> "${model.inputType}" .
        <${model.uid}> <url> "${model.url}" .
      }
    }`;
      console.log('Mutate statement: ', query);

      return this.http.post<any>(url, query, httpMutateOptions)
          .pipe(
              tap(_ => console.info('updated models')),
              catchError(this.handleError<Model>('updateModels'))
          );

  }

  /**
   *
   * @param gatewayUid
   * @param modelUid
   */
  deleteModel(gatewayUid: number, modelUid: number, account: string): Observable<string> {
      const url = `${this.tgdbUrl}/mutate?commitNow=true`;
      const query = `{
      delete {
        <${modelUid}> * * .
        <${gatewayUid}> <gateway_model> <${modelUid}> .
      }
    }`;
      console.log('Delete Model Mutate statement: ', query);

      return this.http.post<any>(url, query, httpMutateOptions)
          .pipe(
              tap(_ => console.info('deleted protocol')),
              catchError(this.handleError<string>('deleteModel'))
          );
  }

  /**
   *
   * @param gatewayName
   */
  getGatewayAndPipelines(gatewayName: any, account: string): Observable<Gateway[]> {
      const url = `${this.tgdbUrl}/query`;

      const pipeline_protocol = 'protocol: pipeline_protocol {uid uuid brokerURL topic maximumQOS username password encryptionMode caCertificate clientCertificate clientKey authMode serverCerticate consumerGroupId connectionTimeout sessionTimeout retryBackoff commitInterval initialOffset fetchMinBytes fetchMaxWait heartbeatInterval}';
      const pipeline_datastore = 'dataStore: pipeline_datastore {uid uuid host port databaseName user password accountName warehouse database schema authType username clientId clientSecret authorizationCode redirectURI loginTimeout url}';
      const pipeline_filter = 'filter: pipeline_filter {uid deviceNames}';

      const query = `{
      resp(func: has(gateway)) @filter(eq(uuid, "${gatewayName}")) {
        uid uuid accessToken
        pipelines: gateway_pipeline {
          uid
          name
          uuid
          protocolType
          protocolId
          dataStoreType
          dataStoreId
          created
          modified
          status
          ${pipeline_protocol}
          ${pipeline_datastore}
          ${pipeline_filter}
        }
      }
    }`;
      console.log('Get Gateway and Pipelines query statement: ', query);

      return this.http.post<any>(url, query, httpOptions)
          .pipe(
              map(response => response.data.resp as Gateway[]),
              tap(_ => console.info('fetched Gateway')),
              catchError(this.handleError<Gateway[]>('getGatewayWithPipelines', []))
          );

  }

  /**
   *
   * @param gatewayName
   */
  getPipelines(gatewayName: any, account: string): Observable<Pipeline[]> {
      const url = `${this.tgdbUrl}/query`;

      const pipeline_protocol = 'protocol: pipeline_protocol {uid brokerURL topic maximumQOS username password encryptionMode caCertificate clientCertificate clientKey authMode serverCerticate consumerGroupId connectionTimeout sessionTimeout retryBackoff commitInterval initialOffset fetchMinBytes fetchMaxWait heartbeatInterval}';
      const pipeline_datastore = 'datastore: pipeline_datastore {uid host port databaseName user password accountName warehouse database schema authType username clientId clientSecret authorizationCode redirectURI loginTimeout url}';
      const pipeline_filter = 'filter: pipeline_filter {uid deviceNames}';

      const query = `{
      var(func: has(gateway)) @filter(eq(uuid, "${gatewayName}")) {
        pipelines as gateway_pipeline {
        }
      }
      resp(func: uid(pipelines)) {
        uid
        name
        uuid
        protocolType
        protocolId
        dataStoreType
        dataStoreId
        created
        modified
        status
        ${pipeline_protocol}
        ${pipeline_datastore}
        ${pipeline_filter}
      }
    }`;

      return this.http.post<any>(url, query, httpOptions)
          .pipe(
              map(response => response.data.resp as Pipeline[]),
              tap(_ => console.info('fetched pipelines')),
              catchError(this.handleError<Pipeline[]>('getPipelines', []))
          );

  }

  /**
   *
   * @param gatewayUid
   * @param pipeline
   * @param transportObj
   * @param dataStoreObj
   * @param filterObj
   */
  addPipeline(gatewayUid: number, pipeline: Pipeline, transportObj: any,
    dataStoreObj: any, filterObj: any, streamingObj: any, account: string): Observable<Pipeline> {

      const url = `${this.tgdbUrl}/mutate?commitNow=true`;

      let query = '';
      console.log('direct from transport name: ', transportObj.Name);



      console.log('TranpostObje prop0: ', transportObj.Properties[0].Value);
      let transportVar = '';
      let dataStoreVar = '';
      let filterVar = '';
      let i = 0;
      let len = transportObj.Properties.length;

      console.log('Looping start for properties: ', len);


      // Create Protocol entries
      for (; i < len; i++) {
          transportVar = transportVar +
        `_:Protocol <${transportObj.Properties[i].UIName}> "${transportObj.Properties[i].Value}" .
      `;
      }

      transportVar = transportVar +
      `_:Protocol <protocol> "" .
      `;
      transportVar = transportVar +
      `_:Protocol <type> "protocol" .
      `;
      transportVar = transportVar +
      `_:Pipeline <pipeline_protocol> _:Protocol .
      `;

      console.log('Build Transport dgraph var: ' + transportVar);


      // Create DataStore entries
      i = 0;
      len = dataStoreObj.Properties.length;

      for (; i < len; i++) {
          dataStoreVar = dataStoreVar +
        `_:Datastore <${dataStoreObj.Properties[i].UIName}> "${dataStoreObj.Properties[i].Value}" .
      `;
      }

      dataStoreVar = dataStoreVar +
      `_:Datastore <datastore> "" .
      `;
      dataStoreVar = dataStoreVar +
      `_:Datastore <type> "datastore" .
      `;
      dataStoreVar = dataStoreVar +
      `_:Pipeline <pipeline_datastore> _:Datastore .
      `;

      console.log('DataStore dgraph var: ' + dataStoreVar);


      // Create Filter entries
      i = 0;
      len = filterObj.Properties.length;

      for (; i < len; i++) {
          filterVar = filterVar +
        `_:Filter <${filterObj.Properties[i].UIName}> "${filterObj.Properties[i].Value}" .
      `;
      }

      filterVar = filterVar +
      `_:Filter <filter> "" .
      `;
      filterVar = filterVar +
      `_:Filter <type> "filter" .
      `;
      filterVar = filterVar +
      `_:Pipeline <pipeline_filter> _:Filter .
      `;

      console.log('Filter dgraph var: ' + filterVar);


      query = `{
      set {
        _:Pipeline <dgraph.type> "Pipeline" .
        _:Pipeline <name> "${pipeline.name}" .
        _:Pipeline <uuid> "${pipeline.name}" .
        _:Pipeline <type> "pipeline" .
        _:Pipeline <pipeline> "" .
        _:Pipeline <created> "${pipeline.created}" .
        _:Pipeline <modified> "${pipeline.modified}" .
        _:Pipeline <status> "${pipeline.status}" .
        <${gatewayUid}> <gateway_pipeline> _:Pipeline .
        ${transportVar}
        ${dataStoreVar}
        ${filterVar}
      }
    }`;
      console.log('Mutate statement: ', query);

      return this.http.post<any>(url, query, httpMutateOptions)
          .pipe(
              tap(_ => console.info('add pipeline')),
              catchError(this.handleError<Pipeline>('addPipelines'))
          );

  }

  /**
   *
   * @param pipeline
   */
  updatePipeline(pipeline: Pipeline, account: string): Observable<Pipeline> {
      const url = `${this.tgdbUrl}/mutate?commitNow=true`;
      const query = `{
      set {
        <${pipeline.uid}> <status> "${pipeline.status}" .
        <${pipeline.uid}> <modified> "${pipeline.modified}" .
      }
    }`;
      console.log('Mutate statement: ', query);

      return this.http.post<any>(url, query, httpMutateOptions)
          .pipe(
              tap(_ => console.info('updated pipelines')),
            catchError(this.handleError<Pipeline>('updatePipelines'))
          );

  }

  /**
   *
   * @param gatewayUid
   * @param pipeline
   */
  deletePipeline(gatewayUid: number, pipeline: Pipeline, account: string): Observable<string> {
      const url = `${this.tgdbUrl}/mutate?commitNow=true`;

      const query = `{
      delete {
        <${pipeline.uid}> * * .
        <${gatewayUid}> <gateway_pipeline> <${pipeline.uid}> .
      }
    }`;
      console.log('Delete Pipeline Mutate statement: ', query);

      return this.http.post<any>(url, query, httpMutateOptions)
          .pipe(
              tap(_ => console.info('deleted pipeline')),
              catchError(this.handleError<string>('deletePipeline'))
          );
  }

  /**
   * Get ids of all the pipelines associated with the specified protocol
   * @param protocolUid - the uid of the protocol
   */
  getPipelineIdsFromProtocolUid(protocolUid: any, account: string): Observable<Pipeline[]> {
      const url = `${this.tgdbUrl}/query`;

      const query = `{
      var(func: uid(${protocolUid})) {
        pipelines as ~pipeline_protocol {
        }
      }
      resp(func: uid(pipelines)) {
        uid
        uuid
      }
    }`;

      return this.http.post<any>(url, query, httpOptions)
          .pipe(
              map(response => response.data.resp as Pipeline[]),
              tap(_ => console.info('fetched pipeline ids')),
              catchError(this.handleError<Pipeline[]>('getPipelineIdsFromProtocolUid', []))
          );

  }

  /**
   * Get ids of all the pipelines associated with the specified data store
   * @param dataStoreUid - the uid of the data store
   */
  getPipelineIdsFromDataStoreUid(dataStoreUid: any, account: string): Observable<Pipeline[]> {
      const url = `${this.tgdbUrl}/query`;

      const query = `{
      var(func: uid(${dataStoreUid})) {
        pipelines as ~pipeline_datastore {
        }
      }
      resp(func: uid(pipelines)) {
        uid
        uuid
      }
    }`;

      return this.http.post<any>(url, query, httpOptions)
          .pipe(
              map(response => response.data.resp as Pipeline[]),
              tap(_ => console.info('fetched pipeline ids')),
              catchError(this.handleError<Pipeline[]>('getPipelineIdsFromDataStoreUid', []))
          );

  }

  /**
   *
   * @param gatewayName
   */
  getModelConfigs(gatewayName: any, account: string): Observable<ModelConfig[]> {
      const url = `${this.tgdbUrl}/query`;
      const query = `{
      var(func: has(gateway)) @filter(eq(uuid, "${gatewayName}")) {
        modelConfigs as gateway_modelconfig {
        }
      }
      resp(func: uid(modelConfigs)) {
        uid
        name
        uuid
        description
        device
        resource
        model
        created
        modified
      }
    }`;

      console.log('getModelConfigs service query: ', query);

      return this.http.post<any>(url, query, httpOptions)
          .pipe(
              map(response => response.data.resp as ModelConfig[]),
              tap(_ => console.info('fetched modelConfigs')),
              catchError(this.handleError<ModelConfig[]>('getModelConfigs', []))
          );

  }

  /**
   *
   * @param gatewayUid
   * @param modelConfig
   */
  addModelConfig(gatewayUid: number, modelConfig: ModelConfig, account: string): Observable<ModelConfig> {
      const url = `${this.tgdbUrl}/mutate?commitNow=true`;
      const query = `{
      set {
        _:ModelConfig <dgraph.type> "ModelConfig" .
        _:ModelConfig <name> "${modelConfig.name}" .
        _:ModelConfig <uuid> "${modelConfig.name}" .
        _:ModelConfig <type> "modelConfig" .
        _:ModelConfig <rule> "" .
        _:ModelConfig <description> "${modelConfig.description}" .
        _:ModelConfig <device> "${modelConfig.device}" .
        _:ModelConfig <resource> "${modelConfig.resource}" .
        _:ModelConfig <model> "${modelConfig.model}" .
        _:ModelConfig <created> "${modelConfig.created}" .
        _:ModelConfig <modified> "${modelConfig.modified}" .
        <${gatewayUid}> <gateway_modelconfig> _:ModelConfig .
      }
    }`;
      console.log('Mutate statement: ', query);

      return this.http.post<any>(url, query, httpMutateOptions)
          .pipe(
              tap(_ => console.info('add modelConfig')),
            catchError(this.handleError<ModelConfig>('addModelConfig'))
          );

  }

  /**
   *
   * @param modelConfig
   */
  updateModelConfig(modelConfig: ModelConfig, account: string): Observable<ModelConfig> {
      const url = `${this.tgdbUrl}/mutate?commitNow=true`;
      const query = `{
      set {
        <${modelConfig.uid}> <name> "${modelConfig.name}" .
        <${modelConfig.uid}> <uuid> "${modelConfig.uuid}" .
        <${modelConfig.uid}> <description> "${modelConfig.description}" .
        <${modelConfig.uid}> <condDevice> "${modelConfig.device}" .
        <${modelConfig.uid}> <condResource> "${modelConfig.resource}" .
        <${modelConfig.uid}> <model> "${modelConfig.model}" .
        <${modelConfig.uid}> <modified> "${modelConfig.modified}" .
      }
    }`;
      console.log('Mutate statement: ', query);

      return this.http.post<any>(url, query, httpMutateOptions)
          .pipe(
              tap(_ => console.info('updated modelConfig')),
            catchError(this.handleError<ModelConfig>('updateModelConfig'))
          );

  }

  /**
   *
   * @param gatewayUid
   * @param modelConfigUid
   */
  deleteModelConfig(gatewayUid: number, modelConfigUid: number, account: string): Observable<string> {
      const url = `${this.tgdbUrl}/mutate?commitNow=true`;
      const query = `{
      delete {
        <${modelConfigUid}> * * .
        <${gatewayUid}> <gateway_modelconfig> <${modelConfigUid}> .
      }
    }`;
      console.log('Delete ModelConfig Mutate statement: ', query);

      return this.http.post<any>(url, query, httpMutateOptions)
          .pipe(
              tap(_ => console.info('deleted modelConfig')),
              catchError(this.handleError<string>('deleteModelConfig'))
          );
  }

  /**
   *
   * @param gatewayName
   */
  getFiltersConfig(gatewayName: any, account: string): Observable<GatewayFiltersConfig[]> {
      const url = `${this.tgdbUrl}/query`;
      const query = `{
      var(func: has(gateway)) @filter(eq(uuid, "${gatewayName}")) {
        filtersConfig as gateway_filter {
        }
      }
      resp(func: uid(filtersConfig)) {
        uid
        deviceNames
      }
    }`;

      console.log('getFiltersConfig service query: ', query);

      return this.http.post<any>(url, query, httpOptions)
          .pipe(
              map(response => response.data.resp as GatewayFiltersConfig[]),
              tap(_ => console.info('fetched filtersConfig')),
              catchError(this.handleError<GatewayFiltersConfig[]>('getFiltersConfigs', []))
          );

  }

  /**
   *
   * @param gatewayUid
   * @param filtersConfig
   */
  addFiltersConfig(gatewayUid: number, filtersConfig: GatewayFiltersConfig, account: string): Observable<GatewayFiltersConfig> {
      const url = `${this.tgdbUrl}/mutate?commitNow=true`;

      const query = `{
      set {
        _:Filter <dgraph.type> "filter" .
        _:Filter <type> "filter" .
        _:Filter <filter> "" .
        _:Filter <deviceNames> "${filtersConfig.deviceNames}" .
        <${gatewayUid}> <gateway_filter> _:Filter .
      }
    }`;
      console.log('Mutate statement: ', query);

      return this.http.post<any>(url, query, httpMutateOptions)
          .pipe(
              tap(_ => console.info('add filtersConfig')),
            catchError(this.handleError<GatewayFiltersConfig>('addFiltersConfig'))
          );

  }

  /**
   *
   * @param filtersConfig
   */
  updateFiltersConfig(filtersConfig: GatewayFiltersConfig, account: string): Observable<GatewayFiltersConfig> {
      const url = `${this.tgdbUrl}/mutate?commitNow=true`;
      const query = `{
      set {
        <${filtersConfig.uid}> <deviceNames> "${filtersConfig.deviceNames}" .
      }
    }`;
      console.log('Mutate statement: ', query);

      return this.http.post<any>(url, query, httpMutateOptions)
          .pipe(
              tap(_ => console.info('updated filtersConfig')),
            catchError(this.handleError<GatewayFiltersConfig>('updateFiltersConfig'))
          );

  }

  /**
   *
   * @param deviceName
   * @param instrumentName
   * @param numReadings
   */
  getReadings(deviceName: any, instrumentName: any, numReadings: any, account: string): Observable<TSReading[]> {
      const url = `${this.tgdbUrl}/search`;

      const query1 = `{
      var(func: has(resource)) @filter(eq(uuid, "${deviceName}_${instrumentName}")) {
        readings as resource_reading (first:-${numReadings}) {
        }
      }
      resp(func: uid(readings), orderasc:created) {
        created
        value
      }
    }`;

      // "g.V().has('gateway','uuid','gateway1').out().has('device','uuid','versicharge_0001').out().has('resource','name','Energy').out();"
      const query = `{
      "query": {
        "language" : "gremlin",
        "queryString": "g.V().has('gateway','uuid','gateway1').out('gateway_device').out('device_resource').has('resource','name','Speedometer').out();"
      }
    }`;

      console.log('Reading query statement: ', query);

      return this.http.post<any>(url, query, httpOptions)
          .pipe(
              map(response => response.queryResult.content.nodes as TSReading[]),
              tap(_ => console.info('fetched readings')),
              catchError(this.handleError<TSReading[]>('getReadings', []))
          );
  }
  /**
   *
   * @param deviceName
   * @param instrumentName
   * @param ts
   */
  getReadingsAt(deviceName: any, instrumentName: any, ts: any, account: string): Observable<TSReading[]> {
      const url = `${this.tgdbUrl}/query`;

      const myquery = `{resp(func: has(reading)) @filter(gt(created, ${ts})) @cascade {value created ~resource_reading @filter(eq(uuid, "${deviceName}_${instrumentName}")) { }}}`;
      const query = `{
      var(func: has(resource)) @filter(eq(uuid, "${deviceName}_${instrumentName}")) {
        readings as resource_reading @filter(eq(created, ${ts})) {
        }
      }
      resp(func: uid(readings), orderasc:created) {
        created
        value
      }
    }`;

      console.log('the query is: ', query);

      // return this.http.post<any>(url, `{resp(func: has(reading)) @filter(gt(created, ${fromts})) @cascade {value created ~resource_reading @filter(eq(uuid, "${deviceName}_${instrumentName}")) { }}}`, httpOptions)
      return this.http.post<any>(url, query, httpOptions)
          .pipe(
              map(response => response.data.resp as TSReading[]),
              tap(_ => console.info('fetched readings')),
              catchError(this.handleError<TSReading[]>('getReadingsAt', []))
          );
  }

  /**
   *
   * @param deviceName
   * @param instrumentName
   * @param fromts
   */
  getReadingsStartingAt(deviceName: any, instrumentName: any, fromts: any, account: string): Observable<TSReading[]> {
      const url = `${this.tgdbUrl}/query`;

      const myquery = `{resp(func: has(reading)) @filter(gt(created, ${fromts})) @cascade {value created ~resource_reading @filter(eq(uuid, "${deviceName}_${instrumentName}")) { }}}`;
      const query = `{
      var(func: has(resource)) @filter(eq(uuid, "${deviceName}_${instrumentName}")) {
        readings as resource_reading @filter(gt(created, ${fromts})) {
        }
      }
      resp(func: uid(readings), orderasc:created) {
        created
        value
      }
    }`;

      console.log('the query is: ', query);

      // return this.http.post<any>(url, `{resp(func: has(reading)) @filter(gt(created, ${fromts})) @cascade {value created ~resource_reading @filter(eq(uuid, "${deviceName}_${instrumentName}")) { }}}`, httpOptions)
      return this.http.post<any>(url, query, httpOptions)
          .pipe(
              map(response => response.data.resp as TSReading[]),
              tap(_ => console.info('fetched readings')),
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
  getReadingsBetween(deviceName: any, instrumentName: any, fromts: any, tots: any, account: string): Observable<TSReading[]> {
      const url = `${this.tgdbUrl}/query`;

      const myquery = `{resp(func: has(reading)) @filter(gt(created, ${fromts})) @cascade {value created ~resource_reading @filter(eq(uuid, "${deviceName}_${instrumentName}")) { }}}`;
      const query = `{
      var(func: has(resource)) @filter(eq(uuid, "${deviceName}_${instrumentName}")) {
        readings as resource_reading @filter(gt(created, ${fromts}) AND lt(created, ${tots})) (first:-500) {
        }
      }
      resp(func: uid(readings), orderasc:created) {
        created
        value
      }
    }`;

      console.log('the query is: ', query);

      // return this.http.post<any>(url, `{resp(func: has(reading)) @filter(gt(created, ${fromts})) @cascade {value created ~resource_reading @filter(eq(uuid, "${deviceName}_${instrumentName}")) { }}}`, httpOptions)
      return this.http.post<any>(url, query, httpOptions)
          .pipe(
              map(response => response.data.resp as TSReading[]),
              tap(_ => console.info('fetched readings')),
              catchError(this.handleError<TSReading[]>('getReadingsBetween', []))
          );
  }

  /**
   *
   * @param deviceName
   */
  getLastReadingsForDevice(deviceName: any, account: string): Observable<TSReading[]> {
      const url = `${this.tgdbUrl}/query`;

      const query = `{
      resp(func: has(device)) @filter(eq(uuid, "${deviceName}")) @normalize {
        device_resource {
          name: name
          resource_reading (first:-1) {
            created: created
            value: value
          }
        }
      }
    }`;

      console.log('Reading query statement: ', query);

      return this.http.post<any>(url, query, httpOptions)
          .pipe(
              map(response => response.data.resp as TSReading[]),
              tap(_ => console.info('fetched readings')),
              catchError(this.handleError<TSReading[]>('getLastReadingsForDevice', []))
          );
  }

  /**
   *
   */
  getNotifications(account: string): Observable<Notification[]> {
      console.log('GetNotifications service called');
      const url = `${this.tgdbUrl}/query`;
      const query = `{
      resp(func: has(notification)) @normalize {
        uid uuid:uuid created:created notifySource:notifySource notifyDevice:notifyDevice notifyResource:notifyResource notifyLevel:notifyLevel value:value description:description ~gateway_notification {
          gateway: uuid
        }
      }
    }`;

      return this.http.post<any>(url, query, httpOptions)
          .pipe(
              map(response => response.data.resp as Notification[]),
              tap(response => console.log('Response from GetNoti: ', response)),
              tap(_ => console.info('fetched notifications')),
              catchError(this.handleError<Notification[]>('getNotifications', []))
          );
  }

  /**
   *
   * @param deviceName
   */
  getRoute(deviceName: string, account: string): any {

      let route = null;

      if (deviceName == 'train-0001') {
          route = route1;
      }
      else if (deviceName == 'train-0002') {
          route = route2;
      }
      else if (deviceName == 'train-0003') {
          route = route3;
      }

      return route;
  }

  /**
   *
   * @param deviceName
   */
  getRouteCenter(deviceName: string, account: string): any {
      let center = null;

      // 39.0 -98.0 zoom 4
      // East 34.765589   -78.709488
      // West 40.487432 -122.803116

      if (deviceName == 'train-0001') {
          center = [34.0, -98.0];
      }
      else if (deviceName == 'train-0002') {
          center = [40.0, -98.0];
      }
      else if (deviceName == 'train-0003') {
          center = [39.0, -98.0];
      }

      return center;
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
      console.log('Got an error.  Handling Error');

      return (error: any): Observable<T> => {

          console.log('Before error report');
          // TODO: send the error to remote logging infrastructure
          console.error(error); // log to console instead
          console.log('After error report');

          // TODO: better job of transforming error for user consumption
          console.info(`${operation} failed: ${error.message}`);

          // Let the app keep running by returning an empty result.
          return of(result as T);
      };
  }


}
