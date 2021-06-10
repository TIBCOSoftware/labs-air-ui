import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RtsfSimulatorService {

  constructor(private http: HttpClient) {
  }

  private getURL(servicePath: string): string {

    let url = `/simulatorEndpoint/http://23.20.170.72:9090${servicePath}`;
    return url;
  }

  getProducts(): Observable<any> {

    let url = this.getURL("/RTSF/products");

    return this.http.get<any>(url)
      .pipe(
        catchError(this.handleError<any>('getProducts'))
      );
  }

  posEvent(event: any): Observable<string> {
    let url = this.getURL("/RTSF/1/pos");

    return this.http.post<string>(url, event)
      .pipe(
        catchError(this.handleError<any>('basketOpen'))
      );
  }

  scaleEvent(event: any): Observable<string> {
    let url = this.getURL("/RTSF/1/scale");

    return this.http.post<string>(url, event)
      .pipe(
        catchError(this.handleError<any>('basketOpen'))
      );
  }

  roiEvent(event: any): Observable<string> {
    let url = this.getURL("/RTSF/1/roi");

    return this.http.post<string>(url, event)
      .pipe(
        catchError(this.handleError<any>('basketOpen'))
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
