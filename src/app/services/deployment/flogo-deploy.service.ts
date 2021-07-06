import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import {AuthService} from '../auth/auth.service';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class FlogoDeployService {
  private f1EndpointUrl = environment.f1EndpointUrl;
  private airEndpointUrl = environment.airEndpointUrl;

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient, private authService: AuthService) {
    let basicAuthHeaders = authService.getBasicAuthHeaders();
    basicAuthHeaders.forEach((value, key) => { 
      this.httpOptions.headers = this.httpOptions.headers.append(key, value);
    } );
  }

  deploy(request: any): Observable<string> {

    const url = `${this.airEndpointUrl}/app-manager/releases`;

    return this.http.post<string>(url, request, this.httpOptions)
      .pipe(
        tap(_ => console.info('Deployed New Pipeline')),
        catchError(this.handleError<string>('deploy'))
      );
  }

  validateF1(pipelineId: string, request: any): Observable<any> {

    // const url = `http://54.81.13.248:5408/f1/air/build/Air-F1_Flogo_Pipeline`;
    // const url = `http://54.81.13.248:5408/f1/air/components/`;
    // const url = `/f1Endpoint/f1/air/deploy/Air-F1_Flogo_Pipeline`;

    // const url = `/edgex/remotegateway/http://52.7.96.87:5408/f1/air/validate/Air-account_00001/${pipelineId}`;
    // const url = `/edgex/remotegateway/http://52.22.89.56:5408/f1/air/validate/Air-account_00001/${pipelineId}`;
    // const url = `/edgex/remotegateway/http://3.228.65.62:5408/f1/air/buildAndDeploy/Air-account_00001/${pipelineId}`;

    const url = `${this.f1EndpointUrl}/f1/air/validate/Air-account_00001/${pipelineId}`;

    console.log("Calling validateF1 with url:", url);

    return this.http.post<string>(url, request, this.httpOptions)
      .pipe(
        tap(_ => console.info('Build New Pipeline')),
        catchError(this.handleError<string>('deploy'))
      );
  }

  deployF1(pipelineId: string, request: any): Observable<any> {

    // const url = `http://54.81.13.248:5408/f1/air/build/Air-F1_Flogo_Pipeline`;
    // const url = `http://54.81.13.248:5408/f1/air/components/`;
    // const url = `/f1Endpoint/f1/air/deploy/Air-F1_Flogo_Pipeline`;
    
    // const url = `/edgex/remotegateway/http://52.7.96.87:5408/f1/air/buildAndDeploy/Air-account_00001/${pipelineId}`;
    // const url = `/edgex/remotegateway/http://52.22.89.56:5408/f1/air/buildAndDeploy/Air-account_00001/${pipelineId}`;
    // const url = `/edgex/remotegateway/http://3.228.65.62:5408/f1/air/buildAndDeploy/Air-account_00001/${pipelineId}`;

    const url = `${this.f1EndpointUrl}/f1/air/buildAndDeploy/Air-account_00001/${pipelineId}`;

    console.log("Calling buildF1 with url:", url);

    return this.http.post<string>(url, request, this.httpOptions)
      .pipe(
        tap(_ => console.info('Deploy Pipeline')),
        catchError(this.handleError<string>('deployF1'))
      );
  }

  undeployF1(pipelineId: string, request: any): Observable<any> {

    // const url = `/airEndpointf1/f1/air/build/Air-F1_Flogo_Pipeline`;

    // const url = `/edgex/remotegateway/http://52.7.96.87:5408/f1/air/undeploy/Air-account_00001/${pipelineId}/001`;
    // const url = `/edgex/remotegateway/http://52.22.89.56:5408/f1/air/undeploy/Air-account_00001/${pipelineId}/001`;
    // const url = `/edgex/remotegateway/http://3.228.65.62:5408/f1/air/undeploy/Air-account_00001/${pipelineId}/001`;

    const url = `${this.f1EndpointUrl}/f1/air/undeploy/Air-account_00001/${pipelineId}/001`;

    return this.http.post<string>(url, request, this.httpOptions)
      .pipe(
        tap(_ => console.info('Undeploy Pipeline')),
        catchError(this.handleError<string>('undeployF1'))
      );
  }

  getFlogoPropertiesF1(request: any): Observable<any> {

    // const url = `http://54.81.13.248:5408/f1/air/build/Air-F1_Flogo_Pipeline`;
    // const url = `http://54.81.13.248:5408/f1/air/components/`;
    // const url = `/f1Endpoint/f1/air/deploy/Air-F1_Flogo_Pipeline`;

    // const url = `/edgex/remotegateway/http://52.7.96.87:5408/f1/air/flogo/properties`;
    // const url = `/edgex/remotegateway/http://52.22.89.56:5408/f1/air/flogo/properties`;
    // const url = `/edgex/remotegateway/http://3.228.65.62:5408/f1/air/flogo/properties`;

    const url = `${this.f1EndpointUrl}/f1/air/flogo/properties`;

    console.log("Calling getFlogoPropertiesF1 with url:", url);
    console.log("Calling getFlogoPropertiesF1 with request:", request);

    return this.http.post<string>(url, request, this.httpOptions)
      .pipe(
        tap(_ => console.info('Got Flogo Properties')),
        catchError(this.handleError<string>('getFlogoPropertiesF1'))
      );
  }

  undeploy(request: { [x: string]: string; params: any; }): Observable<string> {

    let url = "/airEndpoint/app-manager/releases/".concat(request["id"]);
    let searchParams = new URLSearchParams();
    let params = request.params;
    if (params){
      for (var key of Object.keys(params)) {
        searchParams.append(key, params[key]);
      }
    }
    let searchParamsString = searchParams.toString();
    if (searchParamsString){
      url = url.concat("?",searchParamsString);
    }

    return this.http.delete<string>(url, this.httpOptions)
      .pipe(
        tap(_ => console.info('Undeployed Pipeline')),
        catchError(this.handleError<string>('undeploy'))
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

      console.log("Got an error.  Handling Error for:", operation);
      
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

