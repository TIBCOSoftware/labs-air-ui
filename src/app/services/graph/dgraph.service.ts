import { Injectable } from '@angular/core';

import { Observable, of, pipe } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { LogLevel, LogService } from '@tibco-tcstk/tc-core-lib';

import { Gateway, Subscription, Publisher, Pipeline, Rule, Notification, Protocol, DataStore } from '../../shared/models/iot.model';
import { TSReading } from '../../shared/models/iot.model';
import { GraphService } from './graph.service';

// const httpOptions = {
//   headers: new HttpHeaders({ 'Content-Type': 'application/json' })
// };

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/graphql+-' })
};

// const httpMutateOptions = {
//   headers: new HttpHeaders({ 'X-Dgraph-CommitNow': 'true' })
// };

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

@Injectable()
export class DgraphService implements GraphService {

  // Defined as a proxy.  (i.e. http://137.117.38.255:8080)
  private dgraphUrl = '/dgraph';

  /**
   * 
   * @param logger 
   * @param http 
   */
  constructor(private logger: LogService,
    private http: HttpClient) {

    logger.level = LogLevel.Debug;

  }

  /**
   * 
   */
  getGateways(): Observable<Gateway[]> {
    console.log("GetGateways service called")
    const url = `${this.dgraphUrl}/query`;
    let query = `{
      resp(func: has(gateway)) {
        uid uuid description address latitude longitude accessToken createdts updatedts
      }
    }`;

    return this.http.post<any>(url, query, httpOptions)
      .pipe(
        map(response => response.data.resp as Gateway[]),
        tap(_ => this.logger.info('fetched gateways')),
        catchError(this.handleError<Gateway[]>('getGateways', []))
      );
  }

  /**
   * 
   * @param gateway 
   */
  updateGateway(gateway: Gateway): Observable<string> {
    const url = `${this.dgraphUrl}/mutate?commitNow=true`;
    let query = `{
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
        tap(_ => this.logger.info('updated gateway')),
        catchError(this.handleError<string>('updateGateway'))
      );
  }

  /**
   * 
   * @param gateway 
   */
  addGateway(gateway: Gateway): Observable<string> {
    const url = `${this.dgraphUrl}/mutate?commitNow=true`;
    let query = `{
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
        tap(_ => this.logger.info('add gateway')),
        catchError(this.handleError<string>('addGateway'))
      );
  }

  /**
   * 
   * @param gatewayUid 
   */
  deleteGateway(gatewayUid: number): Observable<string> {
    const url = `${this.dgraphUrl}/mutate?commitNow=true`;
    let query = `{
      delete {
        <${gatewayUid}> * * .
      }
    }`;
    console.log('Delete Gateway Mutate statement: ', query);

    return this.http.post<any>(url, query, httpMutateOptions)
      .pipe(
        tap(_ => this.logger.info('deleted gateway')),
        catchError(this.handleError<string>('deleteGateway'))
      );
  }

  /**
   * 
   * @param gatewayName 
   */
  getGatewayAndSubscriptions(gatewayName): Observable<Gateway[]> {
    const url = `${this.dgraphUrl}/query`;
    let query = `{
      resp(func: has(gateway)) @filter(eq(uuid, "${gatewayName}")) {
        uid uuid description address latitude longitude accessToken createdts updatedts
        subscriptions: gateway_subscription {
          uid
          name
          port
          uuid
          user
          path
          enabled
          encryptionAlgorithm
          method
          valueDescriptorFilter
          consumer
          publisher
          destination
          protocol
          compression
          password
          deviceIdentifierFilter
          initializingVector
          origin
          created
          modified
          topic
          format
          address
          encryptionKey
        }
      }
    }`;
    console.log('Get Gateway and Subscriptions query statement: ', query);

    return this.http.post<any>(url, query, httpOptions)
      .pipe(
        map(response => response.data.resp as Gateway[]),
        tap(_ => this.logger.info('fetched Gateway')),
        catchError(this.handleError<Gateway[]>('getGatewayWithSubscriptions', []))
      );

  }

  /**
   * 
   * @param gatewayName 
   */
  getSubscriptions(gatewayName): Observable<Subscription[]> {
    const url = `${this.dgraphUrl}/query`;
    let query = `{
      var(func: has(gateway)) @filter(eq(uuid, "${gatewayName}")) {
        subscriptions as gateway_subscription {
        }
      }
      resp(func: uid(subscriptions)) {
        uid
        name
        port
        uuid
        user
        path
        enabled
        encryptionAlgorithm
        method
        valueDescriptorFilter
        consumer
        publisher
        destination
        protocol
        compression
        password
        deviceIdentifierFilter
        initializingVector
        origin
        created
        modified
        topic
        format
        address
        encryptionKey
      }
    }`;

    return this.http.post<any>(url, query, httpOptions)
      .pipe(
        map(response => response.data.resp as Subscription[]),
        tap(_ => this.logger.info('fetched subscriptions')),
        catchError(this.handleError<Subscription[]>('getSubscriptions', []))
      );

  }

  /**
   * 
   * @param gatewayUid 
   * @param subscription 
   */
  addSubscription(gatewayUid: number, subscription: Subscription): Observable<string> {
    const url = `${this.dgraphUrl}/mutate?commitNow=true`;
    let query = `{
      set {
        _:Subscription <name> "${subscription.name}" .
        _:Subscription <uuid> "${subscription.name}" .
        _:Subscription <type> "subscription" .
        _:Subscription <subscription> "" .
        _:Subscription <port> "${subscription.port}" .
        _:Subscription <user> "${subscription.user}" .
        _:Subscription <path> "${subscription.path}" .
        _:Subscription <enabled> "${subscription.enabled}" .
        _:Subscription <encryptionAlgorithm> "${subscription.encryptionAlgorithm}" .
        _:Subscription <method> "${subscription.method}" .
        _:Subscription <valueDescriptorFilter> "${subscription.valueDescriptorFilter}" .
        _:Subscription <consumer> "${subscription.consumer}" .
        _:Subscription <publisher> "${subscription.publisher}" .
        _:Subscription <destination> "${subscription.destination}" .
        _:Subscription <protocol> "${subscription.protocol}" .
        _:Subscription <compression> "${subscription.compression}" .
        _:Subscription <password> "${subscription.password}" .
        _:Subscription <deviceIdentifierFilter> "${subscription.deviceIdentifierFilter}" .
        _:Subscription <initializingVector> "${subscription.initializingVector}" .
        _:Subscription <origin> "${subscription.origin}" .
        _:Subscription <created> "${subscription.created}" .
        _:Subscription <modified> "${subscription.modified}" .
        _:Subscription <topic> "${subscription.topic}" .
        _:Subscription <format> "${subscription.format}" .
        _:Subscription <address> "${subscription.address}" .
        _:Subscription <encryptionKey> "${subscription.encryptionKey}" .
        <${gatewayUid}> <gateway_subscription> _:Subscription .
      }
    }`;
    console.log('Mutate statement: ', query);

    return this.http.post<any>(url, query, httpMutateOptions)
      .pipe(
        tap(_ => this.logger.info('add subscriptions')),
        catchError(this.handleError<string>('addSubscriptions'))
      );

  }

  /**
   * 
   * @param subscription 
   */
  updateSubscription(subscription: Subscription): Observable<string> {
    const url = `${this.dgraphUrl}/mutate?commitNow=true`;
    let query = `{
      set {
        <${subscription.uid}> <port> "${subscription.port}" .
        <${subscription.uid}> <user> "${subscription.user}" .
        <${subscription.uid}> <path> "${subscription.path}" .
        <${subscription.uid}> <enabled> "${subscription.enabled}" .
        <${subscription.uid}> <encryptionAlgorithm> "${subscription.encryptionAlgorithm}" .
        <${subscription.uid}> <method> "${subscription.method}" .
        <${subscription.uid}> <valueDescriptorFilter> "${subscription.valueDescriptorFilter}" .
        <${subscription.uid}> <consumer> "${subscription.consumer}" .
        <${subscription.uid}> <publisher> "${subscription.publisher}" .
        <${subscription.uid}> <destination> "${subscription.destination}" .
        <${subscription.uid}> <protocol> "${subscription.protocol}" .
        <${subscription.uid}> <compression> "${subscription.compression}" .
        <${subscription.uid}> <password> "${subscription.password}" .
        <${subscription.uid}> <deviceIdentifierFilter> "${subscription.deviceIdentifierFilter}" .
        <${subscription.uid}> <initializingVector> "${subscription.initializingVector}" .
        <${subscription.uid}> <modified> "${subscription.modified}" .
        <${subscription.uid}> <topic> "${subscription.topic}" .
        <${subscription.uid}> <format> "${subscription.format}" .
        <${subscription.uid}> <address> "${subscription.address}" .
        <${subscription.uid}> <encryptionKey> "${subscription.encryptionKey}" .
      }
    }`;
    console.log('Mutate statement: ', query);

    return this.http.post<any>(url, query, httpMutateOptions)
      .pipe(
        tap(_ => this.logger.info('updated subscriptions')),
        catchError(this.handleError<string>('updateSubscriptions'))
      );

  }

  /**
   * 
   * @param gatewayUid 
   * @param subscriptionUid 
   */
  deleteSubscription(gatewayUid: number, subscriptionUid: number): Observable<string> {
    const url = `${this.dgraphUrl}/mutate?commitNow=true`;
    let query = `{
      delete {
        <${subscriptionUid}> * * .
        <${gatewayUid}> <gateway_subscription> <${subscriptionUid}> .
      }
    }`;
    console.log('Delete Subscription Mutate statement: ', query);

    return this.http.post<any>(url, query, httpMutateOptions)
      .pipe(
        tap(_ => this.logger.info('deleted subscription')),
        catchError(this.handleError<string>('deleteSubscription'))
      );
  }

  /**
   * 
   * @param gatewayName 
   */
  getGatewayAndPublishers(gatewayName): Observable<Gateway[]> {
    const url = `${this.dgraphUrl}/query`;
    let query = `{
      resp(func: has(gateway)) @filter(eq(uuid, "${gatewayName}")) {
        uid uuid
        publishers: gateway_publisher {
          uid
          name
          port
          uuid
          protocol
          created
          modified
          topic
          hostname
        }
      }
    }`;
    console.log('Get Gateway and Publishers query statement: ', query);

    return this.http.post<any>(url, query, httpOptions)
      .pipe(
        map(response => response.data.resp as Gateway[]),
        tap(_ => this.logger.info('fetched Gateway')),
        catchError(this.handleError<Gateway[]>('getGatewayWithPublishers', []))
      );

  }

  /**
   * 
   * @param gatewayName 
   */
  getPublishers(gatewayName): Observable<Publisher[]> {
    const url = `${this.dgraphUrl}/query`;
    let query = `{
      var(func: has(gateway)) @filter(eq(uuid, "${gatewayName}")) {
        publishers as gateway_publisher {
        }
      }
      resp(func: uid(publishers)) {
        uid
        name
        port
        uuid
        protocol
        created
        modified
        topic
        hostname
      }
    }`;

    return this.http.post<any>(url, query, httpOptions)
      .pipe(
        map(response => response.data.resp as Publisher[]),
        tap(_ => this.logger.info('fetched publishers')),
        catchError(this.handleError<Publisher[]>('getPublishers', []))
      );

  }

  /**
   * 
   * @param gatewayUid 
   * @param publisher 
   */
  addPublisher(gatewayUid: number, publisher: Publisher): Observable<string> {
    const url = `${this.dgraphUrl}/mutate?commitNow=true`;
    let query = `{
      set {
        _:Publisher <dgraph.type> "Publisher" .
        _:Publisher <name> "${publisher.name}" .
        _:Publisher <uuid> "${publisher.name}" .
        _:Publisher <type> "publisher" .
        _:Publisher <publisher> "" .
        _:Publisher <port> "${publisher.port}" .
        _:Publisher <protocol> "${publisher.protocol}" .
        _:Publisher <created> "${publisher.created}" .
        _:Publisher <modified> "${publisher.modified}" .
        _:Publisher <topic> "${publisher.topic}" .
        _:Publisher <hostname> "${publisher.hostname}" .
        <${gatewayUid}> <gateway_publisher> _:Publisher .
      }
    }`;
    console.log('Mutate statement: ', query);

    return this.http.post<any>(url, query, httpMutateOptions)
      .pipe(
        tap(_ => this.logger.info('add publishers')),
        catchError(this.handleError<string>('addPublishers'))
      );

  }
  /**
   * 
   * @param publisher 
   */
  updatePublisher(publisher: Publisher): Observable<string> {
    const url = `${this.dgraphUrl}/mutate?commitNow=true`;
    let query = `{
      set {
        <${publisher.uid}> <name> "${publisher.name}" .
        <${publisher.uid}> <uuid> "${publisher.name}" .
        <${publisher.uid}> <port> "${publisher.port}" .
        <${publisher.uid}> <protocol> "${publisher.protocol}" .
        <${publisher.uid}> <modified> "${publisher.modified}" .
        <${publisher.uid}> <topic> "${publisher.topic}" .
        <${publisher.uid}> <hostname> "${publisher.hostname}" .
      }
    }`;
    console.log('Mutate statement: ', query);

    return this.http.post<any>(url, query, httpMutateOptions)
      .pipe(
        tap(_ => this.logger.info('updated publishers')),
        catchError(this.handleError<string>('updatePublishers'))
      );

  }

  /**
   * 
   * @param gatewayUid 
   * @param publisherUid 
   */
  deletePublisher(gatewayUid: number, publisherUid: number): Observable<string> {
    const url = `${this.dgraphUrl}/mutate?commitNow=true`;
    let query = `{
      delete {
        <${publisherUid}> * * .
        <${gatewayUid}> <gateway_publisher> <${publisherUid}> .
      }
    }`;
    console.log('Delete Publisher Mutate statement: ', query);

    return this.http.post<any>(url, query, httpMutateOptions)
      .pipe(
        tap(_ => this.logger.info('deleted publisher')),
        catchError(this.handleError<string>('deletePublisher'))
      );
  }

  /**
   * 
   * @param gatewayName 
   */
  getGatewayAndDataStores(gatewayName): Observable<Gateway[]> {
    const url = `${this.dgraphUrl}/query`;
    let query = `{
      resp(func: has(gateway)) @filter(eq(uuid, "${gatewayName}")) {
        uid uuid
        dataStores: gateway_datastore {
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
      }
    }`;
    console.log('Get Gateway and DataStores query statement: ', query);

    return this.http.post<any>(url, query, httpOptions)
      .pipe(
        map(response => response.data.resp as Gateway[]),
        tap(_ => this.logger.info('fetched Gateway')),
        catchError(this.handleError<Gateway[]>('getGatewayWithDataStores', []))
      );

  }

  /**
   * 
   * @param gatewayName 
   */
  getDataStores(gatewayName): Observable<DataStore[]> {
    const url = `${this.dgraphUrl}/query`;
    let query = `{
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
        tap(_ => this.logger.info('fetched dataStores')),
        catchError(this.handleError<DataStore[]>('getDataStores', []))
      );

  }

  /**
   * 
   * @param gatewayUid 
   * @param dataStore 
   */
  addDataStore(gatewayUid: number, dataStore: DataStore): Observable<string> {
    const url = `${this.dgraphUrl}/mutate?commitNow=true`;
    let query = `{
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
        tap(_ => this.logger.info('add dataStores')),
        catchError(this.handleError<string>('addDataStores'))
      );

  }
  /**
   * 
   * @param dataStore 
   */
  updateDataStore(dataStore: DataStore): Observable<string> {
    const url = `${this.dgraphUrl}/mutate?commitNow=true`;
    let query = `{
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
        tap(_ => this.logger.info('updated dataStores')),
        catchError(this.handleError<string>('updateDataStores'))
      );

  }

  /**
   * 
   * @param gatewayUid 
   * @param dataStoreUid 
   */
  deleteDataStore(gatewayUid: number, dataStoreUid: number): Observable<string> {
    const url = `${this.dgraphUrl}/mutate?commitNow=true`;
    let query = `{
      delete {
        <${dataStoreUid}> * * .
        <${gatewayUid}> <gateway_datastore> <${dataStoreUid}> .
      }
    }`;
    console.log('Delete DataStore Mutate statement: ', query);

    return this.http.post<any>(url, query, httpMutateOptions)
      .pipe(
        tap(_ => this.logger.info('deleted dataStore')),
        catchError(this.handleError<string>('deleteDataStore'))
      );
  }


  /**
   * 
   * @param gatewayName 
   */
  getGatewayAndProtocols(gatewayName): Observable<Gateway[]> {
    const url = `${this.dgraphUrl}/query`;
    let query = `{
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
        tap(_ => this.logger.info('fetched Gateway')),
        catchError(this.handleError<Gateway[]>('getGatewayWithProtocols', []))
      );

  }

  /**
   * 
   * @param gatewayName 
   */
  getProtocols(gatewayName): Observable<Protocol[]> {
    const url = `${this.dgraphUrl}/query`;
    let query = `{
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
        tap(_ => this.logger.info('fetched protocols')),
        catchError(this.handleError<Protocol[]>('getProtocols', []))
      );

  }

  /**
   * 
   * @param gatewayUid 
   * @param protocol 
   */
  addProtocol(gatewayUid: number, protocol: Protocol): Observable<string> {
    const url = `${this.dgraphUrl}/mutate?commitNow=true`;
    let query = `{
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
        _:Protocol <retryBackoff> "${protocol.retryBackoff}" .
        _:Protocol <fetchMinBytes> "${protocol.fetchMinBytes}" .
        _:Protocol <fetchMaxWait> "${protocol.fetchMaxWait}" .
        _:Protocol <commitInterval> "${protocol.commitInterval}" .
        _:Protocol <heartbeatInterval> "${protocol.heartbeatInterval}" .
        _:Protocol <maximumQOS> "${protocol.maximumQOS}" .
        _:Protocol <username> "${protocol.username}" .
        _:Protocol <password> "${protocol.password}" .
        _:Protocol <encryptionMode> "${protocol.encryptionMode}" .
        _:Protocol <caCertificate> "${protocol.caCerticate}" .
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
        tap(_ => this.logger.info('add protocols')),
        catchError(this.handleError<string>('addProtocols'))
      );

  }
  /**
   * 
   * @param protocol 
   */
  updateProtocol(protocol: Protocol): Observable<string> {
    const url = `${this.dgraphUrl}/mutate?commitNow=true`;
    let query = `{
      set {
        <${protocol.uid}> <uuid> "${protocol.uuid}" .
        <${protocol.uid}> <modified> "${protocol.modified}" .
        <${protocol.uid}> <protocolType> "${protocol.protocolType}" .
        <${protocol.uid}> <brokerURL> "${protocol.brokerURL}" .
        <${protocol.uid}> <topic> "${protocol.topic}" .
        <${protocol.uid}> <consumerGroupId> "${protocol.consumerGroupId}" .
        <${protocol.uid}> <connectionTimeout> "${protocol.connectionTimeout}" .
        <${protocol.uid}> <sessionTimeout> "${protocol.sessionTimeout}" .
        <${protocol.uid}> <initialOffset> "${protocol.initialOffset}" .
        <${protocol.uid}> <retryBackoff> "${protocol.retryBackoff}" .
        <${protocol.uid}> <fetchMinBytes> "${protocol.fetchMinBytes}" .
        <${protocol.uid}> <fetchMaxWait> "${protocol.fetchMaxWait}" .
        <${protocol.uid}> <commitInterval> "${protocol.commitInterval}" .
        <${protocol.uid}> <heartbeatInterval> "${protocol.heartbeatInterval}" .
        <${protocol.uid}> <maximumQOS> "${protocol.maximumQOS}" .
        <${protocol.uid}> <username> "${protocol.username}" .
        <${protocol.uid}> <password> "${protocol.password}" .
        <${protocol.uid}> <encryptionMode> "${protocol.encryptionMode}" .
        <${protocol.uid}> <caCertificate> "${protocol.caCerticate}" .
        <${protocol.uid}> <clientCertificate> "${protocol.clientCertificate}" .
        <${protocol.uid}> <clientKey> "${protocol.clientKey}" .
        <${protocol.uid}> <authMode> "${protocol.authMode}" .
        <${protocol.uid}> <serverCerticate> "${protocol.serverCertificate}" .
      }
    }`;
    console.log('Mutate statement: ', query);

    return this.http.post<any>(url, query, httpMutateOptions)
      .pipe(
        tap(_ => this.logger.info('updated protocols')),
        catchError(this.handleError<string>('updateProtocols'))
      );

  }

  /**
   * 
   * @param gatewayUid 
   * @param protocolUid 
   */
  deleteProtocol(gatewayUid: number, protocolUid: number): Observable<string> {
    const url = `${this.dgraphUrl}/mutate?commitNow=true`;
    let query = `{
      delete {
        <${protocolUid}> * * .
        <${gatewayUid}> <gateway_protocol> <${protocolUid}> .
      }
    }`;
    console.log('Delete Protocol Mutate statement: ', query);

    return this.http.post<any>(url, query, httpMutateOptions)
      .pipe(
        tap(_ => this.logger.info('deleted protocol')),
        catchError(this.handleError<string>('deleteProtocol'))
      );
  }

  /**
   * 
   * @param gatewayName 
   */
  getGatewayAndPipelines(gatewayName): Observable<Gateway[]> {
    const url = `${this.dgraphUrl}/query`;

    let pipeline_protocol = `protocol: pipeline_protocol {uid uuid brokerURL topic maximumQOS username password encryptionMode caCertificate clientCertificate clientKey authMode serverCerticate consumerGroupId connectionTimeout sessionTimeout retryBackoff commitInterval initialOffset fetchMinBytes fetchMaxWait heartbeatInterval}`;
    let pipeline_datastore = `dataStore: pipeline_datastore {uid uuid host port databaseName user password accountName warehouse database schema authType username clientId clientSecret authorizationCode redirectURI loginTimeout url}`;
    let pipeline_filter = `filter: pipeline_filter {uid deviceNames}`;
    let pipeline_streaming = `streaming: pipeline_streaming {uid deviceName instrumentName function windowType windowSize}`;

    let query = `{
      resp(func: has(gateway)) @filter(eq(uuid, "${gatewayName}")) {
        uid uuid accessToken address
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
          ${pipeline_streaming}
        }
      }
    }`;
    console.log('Get Gateway and Pipelines query statement: ', query);

    return this.http.post<any>(url, query, httpOptions)
      .pipe(
        map(response => response.data.resp as Gateway[]),
        tap(_ => this.logger.info('fetched Gateway')),
        catchError(this.handleError<Gateway[]>('getGatewayWithPipelines', []))
      );

  }

  /**
   * 
   * @param gatewayName 
   */
  getPipelines(gatewayName): Observable<Pipeline[]> {
    const url = `${this.dgraphUrl}/query`;

    let pipeline_protocol = `protocol: pipeline_protocol {uid brokerURL topic maximumQOS username password encryptionMode caCertificate clientCertificate clientKey authMode serverCerticate consumerGroupId connectionTimeout sessionTimeout retryBackoff commitInterval initialOffset fetchMinBytes fetchMaxWait heartbeatInterval}`;
    let pipeline_datastore = `datastore: pipeline_datastore {uid host port databaseName user password accountName warehouse database schema authType username clientId clientSecret authorizationCode redirectURI loginTimeout url}`;
    let pipeline_filter = `filter: pipeline_filter {uid deviceNames}`;
    let pipeline_streaming = `streaming: pipeline_streaming {uid deviceName instrumentName function windowType windowSize}`;

    let query = `{
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
        ${pipeline_streaming}
      }
    }`;

    return this.http.post<any>(url, query, httpOptions)
      .pipe(
        map(response => response.data.resp as Pipeline[]),
        tap(_ => this.logger.info('fetched pipelines')),
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
  addPipeline(gatewayUid: number, pipeline: Pipeline, protocolUid: string,
    dataStoreUid: string, filterObj: any, streamingObj:any): Observable<string> {

    const url = `${this.dgraphUrl}/mutate?commitNow=true`;

    let query = '';

    // Create Filter entries
    let filterVar = '';
    let i = 0;
    let len = filterObj.length;

    for (; i < len; i++) {
      filterVar = filterVar +
        `_:Filter <${filterObj[i].name}> "${filterObj[i].value}" .
      `;
    }

    filterVar = filterVar +
      `_:Filter <dgraph.type> "Filter" .
      `;
    filterVar = filterVar +
      `_:Filter <filter> "" .
      `;
    filterVar = filterVar +
      `_:Filter <type> "filter" .
      `;
    filterVar = filterVar +
      `_:Pipeline <pipeline_filter> _:Filter .
      `;

    console.log("Filter dgraph var: " + filterVar);

    // Create Streaming entries
    let streamingVar = '';
    i = 0;
    len = streamingObj.length;

    for (; i < len; i++) {
      streamingVar = streamingVar +
        `_:Streaming <${streamingObj[i].name}> "${streamingObj[i].value}" .
      `;
    }

    streamingVar = streamingVar +
      `_:Streaming <dgraph.type> "Streaming" .
      `;
    streamingVar = streamingVar +
      `_:Streaming <streaming> "" .
      `;
    streamingVar = streamingVar +
      `_:Streaming <type> "streaming" .
      `;
    streamingVar = streamingVar +
      `_:Pipeline <pipeline_streaming> _:Streaming .
      `;

    console.log("Streaming dgraph var: " + streamingVar);


    query = `{
      set {
        _:Pipeline <dgraph.type> "Pipeline" .
        _:Pipeline <name> "${pipeline.name}" .
        _:Pipeline <uuid> "${pipeline.name}" .
        _:Pipeline <type> "pipeline" .
        _:Pipeline <pipeline> "" .
        _:Pipeline <protocolType> "${pipeline.protocolType}" .
        _:Pipeline <dataStoreType> "${pipeline.dataStoreType}" .
        _:Pipeline <created> "${pipeline.created}" .
        _:Pipeline <modified> "${pipeline.modified}" .
        _:Pipeline <status> "${pipeline.status}" .
        <${gatewayUid}> <gateway_pipeline> _:Pipeline .
        _:Pipeline <pipeline_protocol> <${protocolUid}> .
        _:Pipeline <pipeline_datastore> <${dataStoreUid}> .
        ${filterVar}
        ${streamingVar}
      }
    }`;
    console.log('Mutate statement: ', query);

    return this.http.post<any>(url, query, httpMutateOptions)
      .pipe(
        tap(_ => this.logger.info('add pipeline')),
        catchError(this.handleError<string>('addPipelines'))
      );

  }
  
  /**
   * 
   * @param pipeline 
   */
  updatePipeline(pipeline: Pipeline): Observable<string> {
    const url = `${this.dgraphUrl}/mutate?commitNow=true`;
    let query = `{
      set {
        <${pipeline.uid}> <status> "${pipeline.status}" .
        <${pipeline.uid}> <modified> "${pipeline.modified}" .
      }
    }`;
    console.log('Mutate statement: ', query);

    return this.http.post<any>(url, query, httpMutateOptions)
      .pipe(
        tap(_ => this.logger.info('updated pipelines')),
        catchError(this.handleError<string>('updatePipelines'))
      );

  }

  /**
   * 
   * @param gatewayUid 
   * @param pipeline 
   */
  deletePipeline(gatewayUid: number, pipeline: Pipeline): Observable<string> {
    const url = `${this.dgraphUrl}/mutate?commitNow=true`;
    let protocol = pipeline.protocol;
    let dataStore = pipeline.dataStore;
    let filter = pipeline.filter;
    let streaming = pipeline.streaming;

    let query = `{
      delete {
        <${filter.uid}> * * .
        <${streaming.uid}> * * .
        <${pipeline.uid}> <pipeline_protocol> <${protocol.uid}> .
        <${pipeline.uid}> <pipeline_datastore> <${dataStore.uid}> .
        <${pipeline.uid}> <pipeline_filter> <${filter.uid}> .
        <${pipeline.uid}> <pipeline_streaming> <${streaming.uid}> .
        <${pipeline.uid}> * * .
        <${gatewayUid}> <gateway_pipeline> <${pipeline.uid}> .
      }
    }`;
    console.log('Delete Pipeline Mutate statement: ', query);

    return this.http.post<any>(url, query, httpMutateOptions)
      .pipe(
        tap(_ => this.logger.info('deleted pipeline')),
        catchError(this.handleError<string>('deletePipeline'))
      );
  }

  /**
   * Get ids of all the pipelines associated with the specified protocol
   * @param protocolUid - the uid of the protocol
   */
  getPipelineIdsFromProtocolUid(protocolUid): Observable<Pipeline[]> {
    const url = `${this.dgraphUrl}/query`;

    let query = `{
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
        tap(_ => this.logger.info('fetched pipeline ids')),
        catchError(this.handleError<Pipeline[]>('getPipelineIdsFromProtocolUid', []))
      );

  }
  
  /**
   * Get ids of all the pipelines associated with the specified data store
   * @param dataStoreUid - the uid of the data store
   */
  getPipelineIdsFromDataStoreUid(dataStoreUid): Observable<Pipeline[]> {
    const url = `${this.dgraphUrl}/query`;

    let query = `{
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
        tap(_ => this.logger.info('fetched pipeline ids')),
        catchError(this.handleError<Pipeline[]>('getPipelineIdsFromDataStoreUid', []))
      );

  }
  
  /**
   * 
   * @param gatewayName 
   */
  getRules(gatewayName): Observable<Rule[]> {
    const url = `${this.dgraphUrl}/query`;
    let query = `{
      var(func: has(gateway)) @filter(eq(uuid, "${gatewayName}")) {
        rules as gateway_rule {
        }
      }
      resp(func: uid(rules)) {
        uid
        name
        uuid
        description
        condDevice
        condResource
        condCompareNewMetricToValue
        condCompareNewMetricToValueOp
        condCompareNewMetricValue
        condCompareNewMetricToLastMetric
        condCompareNewMetricToLastMetricOp
        condCompareLastMetricToValue
        condCompareLastMetricToValueOp
        condCompareLastMetricValue
        actionSendNotification
        actionNotification
        actionSendCommand
        actionDevice
        actionResource
        actionValue
        created
        modified
      }
    }`;

    console.log("getRules service query: ", query)

    return this.http.post<any>(url, query, httpOptions)
      .pipe(
        map(response => response.data.resp as Rule[]),
        tap(_ => this.logger.info('fetched rules')),
        catchError(this.handleError<Rule[]>('getRules', []))
      );

  }

  /**
   * 
   * @param gatewayUid 
   * @param rule 
   */
  addRule(gatewayUid: number, rule: Rule): Observable<string> {
    const url = `${this.dgraphUrl}/mutate?commitNow=true`;
    let query = `{
      set {
        _:Rule <dgraph.type> "Rule" .
        _:Rule <name> "${rule.name}" .
        _:Rule <uuid> "${rule.name}" .
        _:Rule <type> "rule" .
        _:Rule <rule> "" .
        _:Rule <description> "${rule.description}" .
        _:Rule <condDevice> "${rule.condDevice}" .
        _:Rule <condResource> "${rule.condResource}" .
        _:Rule <condCompareNewMetricToValue> "${rule.condCompareNewMetricToValue}" .
        _:Rule <condCompareNewMetricToValueOp> "${rule.condCompareNewMetricToValueOp}" .
        _:Rule <condCompareNewMetricValue> "${rule.condCompareNewMetricValue}" .
        _:Rule <condCompareNewMetricToLastMetric> "${rule.condCompareNewMetricToLastMetric}" .
        _:Rule <condCompareNewMetricToLastMetricOp> "${rule.condCompareNewMetricToLastMetricOp}" .
        _:Rule <condCompareLastMetricToValue> "${rule.condCompareLastMetricToValue}" .
        _:Rule <condCompareLastMetricToValueOp> "${rule.condCompareLastMetricToValueOp}" .
        _:Rule <condCompareLastMetricValue> "${rule.condCompareLastMetricValue}" .
        _:Rule <actionSendNotification> "${rule.actionSendNotification}" .
        _:Rule <actionNotification> "${rule.actionNotification}" .
        _:Rule <actionSendCommand> "${rule.actionSendCommand}" .
        _:Rule <actionDevice> "${rule.actionDevice}" .
        _:Rule <actionResource> "${rule.actionResource}" .
        _:Rule <actionValue> "${rule.actionValue}" .
        _:Rule <created> "${rule.created}" .
        _:Rule <modified> "${rule.modified}" .
        <${gatewayUid}> <gateway_rule> _:Rule .
      }
    }`;
    console.log('Mutate statement: ', query);

    return this.http.post<any>(url, query, httpMutateOptions)
      .pipe(
        tap(_ => this.logger.info('add rule')),
        catchError(this.handleError<string>('addRule'))
      );

  }

  /**
   * 
   * @param rule 
   */
  updateRule(rule: Rule): Observable<string> {
    const url = `${this.dgraphUrl}/mutate?commitNow=true`;
    let query = `{
      set {
        <${rule.uid}> <name> "${rule.name}" .
        <${rule.uid}> <uuid> "${rule.uuid}" .
        <${rule.uid}> <description> "${rule.description}" .
        <${rule.uid}> <condDevice> "${rule.condDevice}" .
        <${rule.uid}> <condResource> "${rule.condResource}" .
        <${rule.uid}> <condCompareNewMetricToValue> "${rule.condCompareNewMetricToValue}" .
        <${rule.uid}> <condCompareNewMetricToValueOp> "${rule.condCompareNewMetricToValueOp}" .
        <${rule.uid}> <condCompareNewMetricValue> "${rule.condCompareNewMetricValue}" .
        <${rule.uid}> <condCompareNewMetricToLastMetric> "${rule.condCompareNewMetricToLastMetric}" .
        <${rule.uid}> <condCompareNewMetricToLastMetricOp> "${rule.condCompareNewMetricToLastMetricOp}" .
        <${rule.uid}> <condCompareLastMetricToValue> "${rule.condCompareLastMetricToValue}" .
        <${rule.uid}> <condCompareLastMetricToValueOp> "${rule.condCompareLastMetricToValueOp}" .
        <${rule.uid}> <condCompareLastMetricValue> "${rule.condCompareLastMetricValue}" .
        <${rule.uid}> <actionSendNotification> "${rule.actionSendNotification}" .
        <${rule.uid}> <actionNotification> "${rule.actionNotification}" .
        <${rule.uid}> <actionSendCommand> "${rule.actionSendCommand}" .
        <${rule.uid}> <actionDevice> "${rule.actionDevice}" .
        <${rule.uid}> <actionResource> "${rule.actionResource}" .
        <${rule.uid}> <actionValue> "${rule.actionValue}" .
        <${rule.uid}> <modified> "${rule.modified}" .
      }
    }`;
    console.log('Mutate statement: ', query);

    return this.http.post<any>(url, query, httpMutateOptions)
      .pipe(
        tap(_ => this.logger.info('updated rule')),
        catchError(this.handleError<string>('updateRule'))
      );

  }

  /**
   * 
   * @param gatewayUid 
   * @param ruleUid 
   */
  deleteRule(gatewayUid: number, ruleUid: number): Observable<string> {
    const url = `${this.dgraphUrl}/mutate?commitNow=true`;
    let query = `{
      delete {
        <${ruleUid}> * * .
        <${gatewayUid}> <gateway_rule> <${ruleUid}> .
      }
    }`;
    console.log('Delete Rule Mutate statement: ', query);

    return this.http.post<any>(url, query, httpMutateOptions)
      .pipe(
        tap(_ => this.logger.info('deleted rule')),
        catchError(this.handleError<string>('deleteRule'))
      );
  }

  /**
   * 
   * @param deviceName 
   * @param instrumentName 
   * @param numReadings 
   */
  getReadings(deviceName, instrumentName, numReadings): Observable<TSReading[]> {
    const url = `${this.dgraphUrl}/query`;

    // return this.http.post<any>(url, `{resp(func: has(reading)) @cascade {value created ~resource_reading @filter(eq(uuid, "${deviceName}_${instrumentName}")) {~device_resource @filter (eq(uuid, "${deviceName}")) {}}}}`, httpOptions)
    // return this.http.post<any>(url, `{resp(func: has(reading)) @cascade {value created ~resource_reading @filter(eq(uuid, "${deviceName}_${instrumentName}")) { }}}`, httpOptions)

    let query = `{
      var(func: has(resource)) @filter(eq(uuid, "${deviceName}_${instrumentName}")) {
        readings as resource_reading (first:-${numReadings}) {
        }
      }
      resp(func: uid(readings), orderasc:created) {
        created
        value
      }
    }`;

    console.log('Reading query statement: ', query);

    return this.http.post<any>(url, query, httpOptions)
      .pipe(
        map(response => response.data.resp as TSReading[]),
        tap(_ => this.logger.info('fetched readings')),
        catchError(this.handleError<TSReading[]>('getReadings', []))
      );
  }

  /**
   * 
   * @param deviceName 
   * @param instrumentName 
   * @param fromts 
   */
  getReadingsStartingAt(deviceName, instrumentName, fromts): Observable<TSReading[]> {
    const url = `${this.dgraphUrl}/query`;

    let myquery = `{resp(func: has(reading)) @filter(gt(created, ${fromts})) @cascade {value created ~resource_reading @filter(eq(uuid, "${deviceName}_${instrumentName}")) { }}}`;
    let query = `{
      var(func: has(resource)) @filter(eq(uuid, "${deviceName}_${instrumentName}")) {
        readings as resource_reading @filter(gt(created, ${fromts})) {
        }
      }
      resp(func: uid(readings), orderasc:created) {
        created
        value
      }
    }`;

    console.log("the query is: ", query);

    // return this.http.post<any>(url, `{resp(func: has(reading)) @filter(gt(created, ${fromts})) @cascade {value created ~resource_reading @filter(eq(uuid, "${deviceName}_${instrumentName}")) { }}}`, httpOptions)
    return this.http.post<any>(url, query, httpOptions)
      .pipe(
        map(response => response.data.resp as TSReading[]),
        tap(_ => this.logger.info('fetched readings')),
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
  getReadingsBetween(deviceName, instrumentName, fromts, tots): Observable<TSReading[]> {
    const url = `${this.dgraphUrl}/query`;

    let myquery = `{resp(func: has(reading)) @filter(gt(created, ${fromts})) @cascade {value created ~resource_reading @filter(eq(uuid, "${deviceName}_${instrumentName}")) { }}}`;
    let query = `{
      var(func: has(resource)) @filter(eq(uuid, "${deviceName}_${instrumentName}")) {
        readings as resource_reading @filter(gt(created, ${fromts}) AND lt(created, ${tots})) (first:-500) {
        }
      }
      resp(func: uid(readings), orderasc:created) {
        created
        value
      }
    }`;

    console.log("the query is: ", query);

    // return this.http.post<any>(url, `{resp(func: has(reading)) @filter(gt(created, ${fromts})) @cascade {value created ~resource_reading @filter(eq(uuid, "${deviceName}_${instrumentName}")) { }}}`, httpOptions)
    return this.http.post<any>(url, query, httpOptions)
      .pipe(
        map(response => response.data.resp as TSReading[]),
        tap(_ => this.logger.info('fetched readings')),
        catchError(this.handleError<TSReading[]>('getReadingsBetween', []))
      );
  }

  /**
   * 
   * @param deviceName 
   */
  getLastReadingsForDevice(deviceName): Observable<TSReading[]> {
    const url = `${this.dgraphUrl}/query`;

    let query = `{
      resp(func: has(device)) @filter(eq(uuid, "${deviceName}")) @normalize {
        device_resource {
          name: name
          resource_reading (first:-1) {
            created: created
            value: value
          }
        }
      }
    }`

    console.log('Reading query statement: ', query);

    return this.http.post<any>(url, query, httpOptions)
      .pipe(
        map(response => response.data.resp as TSReading[]),
        tap(_ => this.logger.info('fetched readings')),
        catchError(this.handleError<TSReading[]>('getLastReadingsForDevice', []))
      );
  }

  /**
   * 
   */
  getNotifications(): Observable<Notification[]> {
    console.log("GetNotifications service called")
    const url = `${this.dgraphUrl}/query`;
    let query = `{
      resp(func: has(notification)) @normalize {
        uid uuid:uuid created:created notifySource:notifySource notifyDevice:notifyDevice notifyResource:notifyResource notifyLevel:notifyLevel value:value description:description ~gateway_notification {
          gateway: uuid
        }
      }
    }`;

    return this.http.post<any>(url, query, httpOptions)
      .pipe(
        map(response => response.data.resp as Notification[]),
        tap(response => console.log("Response from GetNoti: ", response)),
        tap(_ => this.logger.info('fetched notifications')),
        catchError(this.handleError<Notification[]>('getNotifications', []))
      );
  }

  /**
   * 
   * @param deviceName 
   */
  getRoute(deviceName): any {

    let route = null;

    if (deviceName == "train-0001") {
      route = route1;
    }
    else if (deviceName == "train-0002") {
      route = route2;
    }
    else if (deviceName == "train-0003") {
      route = route3;
    }

    return route;
  }

  /**
   * 
   * @param deviceName 
   */
  getRouteCenter(deviceName): any {
    let center = null;

    // 39.0 -98.0 zoom 4
    // East 34.765589   -78.709488
    // West 40.487432 -122.803116

    if (deviceName == "train-0001") {
      center = [34.0, -98.0];
    }
    else if (deviceName == "train-0002") {
      center = [40.0, -98.0];
    }
    else if (deviceName == "train-0003") {
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
    console.log("Got an error.  Handling Error");

    return (error: any): Observable<T> => {

      console.log("Before error report");
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead
      console.log("After error report");

      // TODO: better job of transforming error for user consumption
      this.logger.info(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
