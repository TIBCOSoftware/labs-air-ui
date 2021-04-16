import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { LogLevel, LogService } from '@tibco-tcstk/tc-core-lib';
import {AuthService} from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class FlogoDeployService {

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private logger: LogService,
    private http: HttpClient, private authService: AuthService) {

    logger.level = LogLevel.Debug;
    let basicAuthHeaders = authService.getBasicAuthHeaders();
    for (let key in basicAuthHeaders) {
      let value = basicAuthHeaders[key];
      this.httpOptions.headers = this.httpOptions.headers.append(key, value);
    }

  }

  deploy(request): Observable<string> {

    const url = `/airEndpoint/app-manager/releases`;

    return this.http.post<string>(url, request, this.httpOptions)
      .pipe(
        tap(_ => this.logger.info('Deployed New Pipeline')),
        catchError(this.handleError<string>('deploy'))
      );
  }

  validateF1(pipelineId, request): Observable<any> {

    // const url = `http://54.81.13.248:5408/f1/air/build/Air-F1_Flogo_Pipeline`;
    // const url = `http://54.81.13.248:5408/f1/air/components/`;
    // const url = `/f1Endpoint/f1/air/deploy/Air-F1_Flogo_Pipeline`;

    // const url = `/edgex/remotegateway/http://52.7.96.87:5408/f1/air/validate/Air-account_00001/${pipelineId}`;
    const url = `/edgex/remotegateway/http://52.22.89.56:5408/f1/air/validate/Air-account_00001/${pipelineId}`;
    // const url = `/edgex/remotegateway/http://3.228.65.62:5408/f1/air/buildAndDeploy/Air-account_00001/${pipelineId}`;

    console.log("Calling validateF1 with url:", url);

    return this.http.post<string>(url, request, this.httpOptions)
      .pipe(
        tap(_ => this.logger.info('Build New Pipeline')),
        catchError(this.handleError<string>('deploy'))
      );
  }

  deployF1(pipelineId, request): Observable<any> {

    // const url = `http://54.81.13.248:5408/f1/air/build/Air-F1_Flogo_Pipeline`;
    // const url = `http://54.81.13.248:5408/f1/air/components/`;
    // const url = `/f1Endpoint/f1/air/deploy/Air-F1_Flogo_Pipeline`;
    
    // const url = `/edgex/remotegateway/http://52.7.96.87:5408/f1/air/buildAndDeploy/Air-account_00001/${pipelineId}`;
    const url = `/edgex/remotegateway/http://52.22.89.56:5408/f1/air/buildAndDeploy/Air-account_00001/${pipelineId}`;
    // const url = `/edgex/remotegateway/http://3.228.65.62:5408/f1/air/buildAndDeploy/Air-account_00001/${pipelineId}`;

    console.log("Calling buildF1 with url:", url);

    return this.http.post<string>(url, request, this.httpOptions)
      .pipe(
        tap(_ => this.logger.info('Deploy Pipeline')),
        catchError(this.handleError<string>('deploy'))
      );
  }

  undeployF1(pipelineId, request): Observable<any> {

    // const url = `/airEndpointf1/f1/air/build/Air-F1_Flogo_Pipeline`;

    // const url = `/edgex/remotegateway/http://52.7.96.87:5408/f1/air/undeploy/Air-account_00001/${pipelineId}/001`;
    const url = `/edgex/remotegateway/http://52.22.89.56:5408/f1/air/undeploy/Air-account_00001/${pipelineId}/001`;
    // const url = `/edgex/remotegateway/http://3.228.65.62:5408/f1/air/undeploy/Air-account_00001/${pipelineId}/001`;

    return this.http.post<string>(url, request, this.httpOptions)
      .pipe(
        tap(_ => this.logger.info('Undeploy Pipeline')),
        catchError(this.handleError<string>('deploy'))
      );
  }

  undeploy(request): Observable<string> {

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
        tap(_ => this.logger.info('Undeployed Pipeline')),
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
    console.log("Got an error.  Handling Error for:", operation);
    
    return (error: any): Observable<T> => {
      console.error('Inside the handleError function');
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.logger.info(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}

