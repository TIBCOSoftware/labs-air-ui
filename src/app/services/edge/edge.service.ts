import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { catchError, map, tap, timeout } from 'rxjs/operators';

import { Device, Profile, Service, Subscription, GetCommandResponse, Gateway, Rule, ModelConfig, FiltersConfig } from '../../shared/models/iot.model';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'Bearer XXXXXXXXXXXXXXXXXXXXXXXX'
  })
};

const httpTextResponseOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'Bearer XXXXXXXXXXXXXXXXXXXXXXXX'
  }),
  observe: 'body' as 'body',
  responseType: 'text' as 'json'
};

@Injectable({
  providedIn: 'root'
})
export class EdgeService {

  // Core metadata http://localhost:48081/api/v1
  // Core data  http://localhost:48080/api/v1
  // Core command http://localhost:48082/api/v1

  // Edgex non-secured service ports and path
  private edgexCoreMetadataPortAndPath = '48081/api/v1/';
  private edgexCoreDataPortAndPath = '48080/api/v1/';
  private edgexCoreCommandPortAndPath = '48082/api/v1/';


  // EdgeX service urls are proxied in the proxy.conf.prod.* files
  private edgexCoreMetadataPath = '/metadata/api/v1/';
  private edgexCoreDataPath = '/coredata/api/v1/';
  private edgexCoreCommandPath = '/command/api/v1/';
  private edgexExportClientPath = '/export/api/v1/';

  private edgexFlogoRulesPath = '/flogorules/api/v1/';
  private edgexInferencingPath = '/inferencing/api/v1/';
  private edgexFilteringPath = '/filtering/api/v1/';

  /**
   * 
   * @param http 
   * @param logger 
   */
  constructor(private http: HttpClient) {
  }

  /**
   * 
   * @param accessToken used to determine if call should be to a secured proxy or not
   * @param hostname 
   * @param servicePath 
   * @param operation 
   */
  private getEdgexURL(hostname: string, servicePath: string, operation: string): string {

    let url = ``;

    if (hostname == 'localhost') {
      url = `/edgex/localgateway${servicePath}${operation}`;
    }
    else {
      url = `/edgex/remotegateway/https://${hostname}:8443${servicePath}${operation}`;
    }

    console.log("getEdgexURL: ", url);
    return url;
  }

  /**
   * 
   * @param accessToken used to determine if call should be to a secured proxy or not
   * @param hostname 
   * @param servicePath 
   * @param operation 
   */
  private getUnsecuredEdgexURL(hostname: string, servicePath: string, operation: string): string {

    let url = ``;

    url = `/edgex/remotegateway/http://${hostname}:${servicePath}${operation}`;

    console.log("getUnsecuredEdgexURL: ", url);
    return url;
  }

  // Core Metadata Operations

  /**
   * 
   * @param gateway 
   */
  pingCoreMetadata(gateway: Gateway): Observable<string> {

    // const url1 = `https://localhost:8443/metadata/api/v1/ping`;
    // const url = `/${gateway.uuid}${this.gatewayCoreMetadataPath}/ping`;

    let url = '';
    let secured = gateway.accessToken != "NONE"

    console.log("Service is secured: ", secured);
    

    if (secured) {
      console.log("Calling secured url");
      
      url = this.getEdgexURL(gateway.address, this.edgexCoreMetadataPath, 'ping');
    }
    else {
      console.log("Calling unsecured url");
      url = this.getUnsecuredEdgexURL(gateway.address, this.edgexCoreMetadataPortAndPath, 'ping');
    }
    

    const authorizedHeaders = httpTextResponseOptions.headers.set('Authorization', 'Bearer ' + gateway.accessToken);
    httpTextResponseOptions.headers = authorizedHeaders;

    return this.http.get<string>(url, httpTextResponseOptions)
      .pipe(
        timeout(2000),
        tap(_ => console.info('received ping response')),
        catchError(this.handleError<string>('pingGateway'))
      );
  }

  /**
   * 
   * @param gateway 
   */
  getDevices(gateway: Gateway): Observable<Device[]> {
    // const url = `/${gateway.uuid}${this.gatewayCoreMetadataPath}/device`;

    let url = '';
    let secured = gateway.accessToken != "NONE"

    if (secured) {
      url = this.getEdgexURL(gateway.address, this.edgexCoreMetadataPath, 'device');
    }
    else {
      url = this.getUnsecuredEdgexURL(gateway.address, this.edgexCoreMetadataPortAndPath, 'device')
    }

    console.log("GetDevices service called for url:", url);

    const authorizedHeaders = httpOptions.headers.set('Authorization', 'Bearer ' + gateway.accessToken);

    httpOptions.headers = authorizedHeaders;

    return this.http.get<Device[]>(url, httpOptions)
      .pipe(
        tap(_ => console.info('fetched devices')),
        catchError(this.handleError<Device[]>('getDevices', []))
      );
  }

  /**
   * 
   * @param gateway 
   * @param id 
   */
  getDevice(gateway: Gateway, id: string): Observable<Device> {
    // const url = `/${gateway.uuid}${this.gatewayCoreMetadataPath}/device/${id}`;
    const op = `device/${id}`

    let url = '';
    let secured = gateway.accessToken != "NONE"

    if (secured) {
      url = this.getEdgexURL(gateway.address, this.edgexCoreMetadataPath, op);
    }
    else {
      url = this.getUnsecuredEdgexURL(gateway.address, this.edgexCoreMetadataPortAndPath, op);
    }

    const authorizedHeaders = httpOptions.headers.set('Authorization', 'Bearer ' + gateway.accessToken);
    httpOptions.headers = authorizedHeaders;

    return this.http.get<Device>(url, httpOptions)
      .pipe(
        tap(_ => console.info(`fetched device id=${id}`)),
        catchError(this.handleError<Device>(`getDevice id=${id}`))
      );
  }

  /**
   * 
   * @param gateway 
   * @param device 
   */
  addDevice(gateway: Gateway, device: any): Observable<String> {
    // const url = `/${gateway.uuid}${this.gatewayCoreMetadataPath}/device`;

    let url = '';
    let secured = gateway.accessToken != "NONE"

    if (secured) {
      url = this.getEdgexURL(gateway.address, this.edgexCoreMetadataPath, 'device');
    }
    else {
      url = this.getUnsecuredEdgexURL(gateway.address, this.edgexCoreMetadataPortAndPath, 'device');
    }
    

    const authorizedHeaders = httpTextResponseOptions.headers.set('Authorization', 'Bearer ' + gateway.accessToken);
    httpTextResponseOptions.headers = authorizedHeaders;

    return this.http.post<string>(url, device, httpTextResponseOptions)
      .pipe(
        tap(_ => console.info('added new device')),
        catchError(this.handleError<string>('addDevice'))
      );
  }

  /**
   * 
   * @param gateway 
   * @param deviceName 
   */
  deleteDeviceByName(gateway: Gateway, deviceName: string): Observable<String> {
    // const url = `/${gateway.uuid}${this.gatewayCoreMetadataPath}/device/name/${deviceName}`;
    const op = `device/name/${deviceName}`;

    let url = '';
    let secured = gateway.accessToken != "NONE"

    if (secured) {
      url = this.getEdgexURL(gateway.address, this.edgexCoreMetadataPath, op);
    }
    else {
      url = this.getUnsecuredEdgexURL(gateway.address, this.edgexCoreMetadataPortAndPath, op);
    }
    
    const authorizedHeaders = httpTextResponseOptions.headers.set('Authorization', 'Bearer ' + gateway.accessToken);
    httpTextResponseOptions.headers = authorizedHeaders;

    return this.http.delete<string>(url, httpTextResponseOptions)
      .pipe(
        tap(_ => console.info('added new device')),
        catchError(this.handleError<string>('addDevice'))
      );
  }

  /**
   * 
   * @param gateway 
   */
  getProfiles(gateway: Gateway): Observable<Profile[]> {
    // const url = `/${gateway.uuid}${this.gatewayCoreMetadataPath}/deviceprofile`;

    let url = '';
    let secured = gateway.accessToken != "NONE"

    if (secured) {
      url = this.getEdgexURL(gateway.address, this.edgexCoreMetadataPath, 'deviceprofile');
    }
    else {
      url = this.getUnsecuredEdgexURL(gateway.address, this.edgexCoreMetadataPortAndPath, 'deviceprofile');
    }

    console.log("GetProfiles service called for url:", url);

    const authorizedHeaders = httpOptions.headers.set('Authorization', 'Bearer ' + gateway.accessToken);
    httpOptions.headers = authorizedHeaders;

    return this.http.get<Profile[]>(url, httpOptions)
      .pipe(
        tap(_ => console.info('fetched profiles')),
        catchError(this.handleError<Profile[]>('getProfiles', []))
      );
  }

  /**
   * 
   * @param gateway 
   * @param profile 
   */
  addProfile(gateway: Gateway, profile: Profile): Observable<string> {

    // const url = `/${gateway.uuid}${this.gatewayCoreMetadataPath}/deviceprofile`;

    let url = '';
    let secured = gateway.accessToken != "NONE"

    if (secured) {
      url = this.getEdgexURL(gateway.address, this.edgexCoreMetadataPath, 'deviceprofile');
    }
    else {
      url = this.getUnsecuredEdgexURL(gateway.address, this.edgexCoreMetadataPortAndPath, 'deviceprofile');
    }

    const authorizedHeaders = httpTextResponseOptions.headers.set('Authorization', 'Bearer ' + gateway.accessToken);
    httpTextResponseOptions.headers = authorizedHeaders;

    return this.http.post<string>(url, profile, httpTextResponseOptions)
      .pipe(
        tap(_ => console.info('added new profile')),
        catchError(this.handleError<string>('addProfile'))
      );
  }

  /**
   * 
   * @param gateway 
   * @param profile 
   */
  updateProfile(gateway: Gateway, profile: Profile): Observable<string> {

    // const url = `/${gateway.uuid}${this.gatewayCoreMetadataPath}/deviceprofile`;
    let url = '';
    let secured = gateway.accessToken != "NONE"

    if (secured) {
      url = this.getEdgexURL(gateway.address, this.edgexCoreMetadataPath, 'deviceprofile');
    }
    else {
      url = this.getUnsecuredEdgexURL(gateway.address, this.edgexCoreMetadataPortAndPath, 'deviceprofile');
    }

    const authorizedHeaders = httpTextResponseOptions.headers.set('Authorization', 'Bearer ' + gateway.accessToken);
    httpTextResponseOptions.headers = authorizedHeaders;

    return this.http.put<string>(url, profile, httpTextResponseOptions)
      .pipe(
        tap(_ => console.info('updated profile')),
        catchError(this.handleError<string>('updateProfile'))
      );
  }

  /**
   * 
   * @param gateway 
   */
  getServices(gateway: Gateway): Observable<Service[]> {
    // const url = `/${gateway.uuid}${this.gatewayCoreMetadataPath}/deviceservice`;

    let url = '';
    let secured = gateway.accessToken != "NONE"

    if (secured) {
      url = this.getEdgexURL(gateway.address, this.edgexCoreMetadataPath, 'deviceservice');
    }
    else {
      url = this.getUnsecuredEdgexURL(gateway.address, this.edgexCoreMetadataPortAndPath, 'deviceservice');
    }

    console.log("GetServices service called for url:", url);
    const authorizedHeaders = httpOptions.headers.set('Authorization', 'Bearer ' + gateway.accessToken);
    httpOptions.headers = authorizedHeaders;

    return this.http.get<Service[]>(url, httpOptions)
      .pipe(
        tap(_ => console.info('fetched services')),
        catchError(this.handleError<Service[]>('getServices', []))
      );
  }

  // Core Command Operations

  /**
   * 
   * @param gateway 
   * @param cmdPath 
   */
  getCommand(gateway: Gateway, cmdPath: string): Observable<GetCommandResponse> {
    // const url = `/${gateway.uuid}${this.gatewayCoreCommandPath}/${cmdPath}`;

    let url = '';
    let secured = gateway.accessToken != "NONE"

    if (secured) {
      url = this.getEdgexURL(gateway.address, this.edgexCoreCommandPath, cmdPath);
    }
    else {
      url = this.getUnsecuredEdgexURL(gateway.address, this.edgexCoreCommandPortAndPath, cmdPath)
    }

    console.log("Get command Url: ", url);
    const authorizedHeaders = httpOptions.headers.set('Authorization', 'Bearer ' + gateway.accessToken);
    httpOptions.headers = authorizedHeaders;

    return this.http.get<GetCommandResponse>(url, httpOptions)
      .pipe(
        tap(_ => console.info(`fetched get response`)),
        catchError(this.handleError<GetCommandResponse>(`getCommand response`))
      );

  }

  // Export Client Operations

  /**
   * 
   * @param gateway 
   * @param subscription 
   */
  addRegisteration(gateway: Gateway, subscription: Subscription): Observable<String> {
    // const url = `/${gateway.uuid}${this.gatewayExportClientPath}/registration`;
    const url = this.getEdgexURL(gateway.address, this.edgexExportClientPath, 'registration');

    // const url = `https://localhost:8443/export/api/v1/registration`;

    let deviceFilter: string[] = [];
    if (subscription.deviceIdentifierFilter.length > 0) {
      let dfilter = subscription.deviceIdentifierFilter.replace(/\s+/g, '');
      deviceFilter = dfilter.split(',');
    }

    let valueDescriptorFilter: string[] = [];
    if (subscription.valueDescriptorFilter.length > 0) {
      let vdfilter = subscription.valueDescriptorFilter.replace(/\s+/g, '');
      valueDescriptorFilter = vdfilter.split(',');
    }

    let query = {
      "origin": subscription.origin,
      "name": subscription.name,
      "addressable": {
        "origin": subscription.origin,
        "name": subscription.consumer,
        "publisher": subscription.publisher,
        "protocol": subscription.protocol,
        "method": subscription.method,
        "address": subscription.address,
        "port": subscription.port,
        "topic": subscription.topic,
        "path": subscription.path,
        "user": subscription.user,
        "password": subscription.password
      },
      "filter": {
        "deviceIdentifiers": deviceFilter,
        "valueDescriptorIdentifiers": valueDescriptorFilter
      },
      "encryption": {
        "encryptionAlgorith": subscription.encryptionAlgorithm,
        "encryptionKey": "",
        "initializingVector": ""
      },
      "compression": subscription.compression,
      "format": subscription.format,
      "enable": subscription.enabled,
      "destination": subscription.destination
    };

    const authorizedHeaders = httpTextResponseOptions.headers.set('Authorization', 'Bearer ' + gateway.accessToken);

    httpTextResponseOptions.headers = authorizedHeaders;

    return this.http.post<string>(url, query, httpTextResponseOptions)
      .pipe(
        tap(_ => console.info('registered to receive events')),
        catchError(this.handleError<string>('addRegistration'))
      );
  }

  /**
   * 
   * @param gateway 
   * @param subscription 
   */
  updateRegisteration(gateway: Gateway, subscription: Subscription): Observable<string> {
    // const url = `/${gateway.uuid}${this.gatewayExportClientPath}/registration`;
    const url = this.getEdgexURL(gateway.address, this.edgexExportClientPath, 'registration');

    let deviceFilter: string[] = [];
    if (subscription.deviceIdentifierFilter.length > 0) {
      let dfilter = subscription.deviceIdentifierFilter.replace(/\s+/g, '');
      deviceFilter = dfilter.split(',');
    }

    let valueDescriptorFilter: string[] = [];
    if (subscription.valueDescriptorFilter.length > 0) {
      let vdfilter = subscription.valueDescriptorFilter.replace(/\s+/g, '');
      valueDescriptorFilter = vdfilter.split(',');
    }

    let query = {
      "name": subscription.name,
      "addressable": {
        "name": subscription.consumer,
        "publisher": subscription.publisher,
        "protocol": subscription.protocol,
        "method": subscription.method,
        "address": subscription.address,
        "port": subscription.port,
        "path": subscription.path,
        "user": subscription.user,
        "password": subscription.password
      },
      "filter": {
        "deviceIdentifiers": deviceFilter,
        "valueDescriptorIdentifiers": valueDescriptorFilter
      },
      "encryption": {
        "encryptionAlgorith": subscription.encryptionAlgorithm,
        "encryptionKey": "",
        "initializingVector": ""
      },
      "compression": subscription.compression,
      "format": subscription.format,
      "enable": subscription.enabled,
      "destination": subscription.destination
    }

    const authorizedHeaders = httpTextResponseOptions.headers.set('Authorization', 'Bearer ' + gateway.accessToken);
    httpTextResponseOptions.headers = authorizedHeaders;

    return this.http.put<string>(url, query, httpTextResponseOptions)
      .pipe(
        tap(_ => console.info('registered to receive events')),
        catchError(this.handleError<string>('addRegistration'))
      );
  }

  /**
   * 
   * @param gateway 
   * @param subscriptionName 
   */
  deleteRegisteration(gateway: Gateway, subscriptionName: string): Observable<string> {
    // const url = `/${gateway.uuid}${this.gatewayExportClientPath}/registration/name/${subscriptionName}`;
    const op = `registration/name/${subscriptionName}`;
    const url = this.getEdgexURL(gateway.address, this.edgexExportClientPath, op);

    const authorizedHeaders = httpTextResponseOptions.headers.set('Authorization', 'Bearer ' + gateway.accessToken);
    httpTextResponseOptions.headers = authorizedHeaders;

    return this.http.delete<string>(url, httpTextResponseOptions)
      .pipe(
        tap(_ => console.info('registered to receive events')),
        catchError(this.handleError<string>('addRegistration'))
      );
  }

  /**
   * 
   * @param gateway 
   * @param rule 
   */
  addRule(gateway: Gateway, rule: Rule): Observable<string> {

    // const url = `/${gateway.uuid}${this.edgeFlogoRulesUrl}addRule`;
    const url = this.getEdgexURL(gateway.address, this.edgexFlogoRulesPath, 'addRule');

    const authorizedHeaders = httpTextResponseOptions.headers.set('Authorization', 'Bearer ' + gateway.accessToken);
    httpTextResponseOptions.headers = authorizedHeaders;

    console.log("Adding Rule: ", rule);


    return this.http.post<string>(url, rule, httpTextResponseOptions)
      .pipe(
        tap(_ => console.info('added rule')),
        catchError(this.handleError<string>('addRule'))
      );
  }

  /**
   * 
   * @param gateway 
   * @param rule 
   */
  deleteRule(gateway: Gateway, rule: Rule): Observable<string> {

    // const url = `/${gateway.uuid}${this.edgeFlogoRulesUrl}deleteRule`;
    const url = this.getEdgexURL(gateway.address, this.edgexFlogoRulesPath, 'deleteRule');

    const authorizedHeaders = httpTextResponseOptions.headers.set('Authorization', 'Bearer ' + gateway.accessToken);
    httpTextResponseOptions.headers = authorizedHeaders;

    return this.http.post<string>(url, rule, httpTextResponseOptions)
      .pipe(
        tap(_ => console.info('added rule')),
        catchError(this.handleError<string>('deleteRule'))
      );
  }

  /**
   * 
   * @param gateway 
   * @param modelConfig 
   */
  addModelConfig(gateway: Gateway, modelConfig: ModelConfig): Observable<string> {

    const url = this.getEdgexURL(gateway.address, this.edgexInferencingPath, 'addModelConf');

    const authorizedHeaders = httpTextResponseOptions.headers.set('Authorization', 'Bearer ' + gateway.accessToken);
    httpTextResponseOptions.headers = authorizedHeaders;

    return this.http.post<string>(url, modelConfig, httpTextResponseOptions)
      .pipe(
        tap(_ => console.info('added modelConfig')),
        catchError(this.handleError<string>('addModelConfig'))
      );
  }

  /**
   * 
   * @param gateway 
   * @param modelConfig 
   */
  deleteModelConfig(gateway: Gateway, modelConfig: ModelConfig): Observable<string> {

    const url = this.getEdgexURL(gateway.address, this.edgexInferencingPath, 'deleteModelConf');

    const authorizedHeaders = httpTextResponseOptions.headers.set('Authorization', 'Bearer ' + gateway.accessToken);
    httpTextResponseOptions.headers = authorizedHeaders;

    return this.http.post<string>(url, modelConfig, httpTextResponseOptions)
      .pipe(
        tap(_ => console.info('deleted modelConfig')),
        catchError(this.handleError<string>('deleteModelConfig'))
      );
  }

  /**
   * 
   * @param gateway 
   * @param filtersConfig 
   */
  setFiltersConfig(gateway: Gateway, filtersConfig: FiltersConfig): Observable<string> {

    const url = this.getEdgexURL(gateway.address, this.edgexFilteringPath, 'setFiltersConf');

    const authorizedHeaders = httpTextResponseOptions.headers.set('Authorization', 'Bearer ' + gateway.accessToken);
    httpTextResponseOptions.headers = authorizedHeaders;

    return this.http.post<string>(url, filtersConfig, httpTextResponseOptions)
      .pipe(
        tap(_ => console.info('set filtersConfig')),
        catchError(this.handleError<string>('setFiltersConfig'))
      );
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error('Inside the handleError function');
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      console.info(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
