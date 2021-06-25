import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { GraphService } from '../../../services/graph/graph.service';
import { DataStore } from '../../../shared/models/iot.model';

export interface SelectItem {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-data-stores',
  templateUrl: './data-stores.component.html',
  styleUrls: ['./data-stores.component.css']
})
export class DataStoresComponent implements OnInit {

  hidePassword = true;

  postgresDataStore = false;
  snowflakeDataStore = false;
  oracleDataStore = false;
  mysqlDataStore = false;
  tgdbDataStore = false;
  dgraphDataStore = false;

  dataStores: DataStore[];

  dataStoresOld: SelectItem[] = [
    { value: 'Postgres', viewValue: 'Postgres' },
    { value: 'Snowflake', viewValue: 'Snowflake' },
    { value: 'Oracle', viewValue: 'Oracle' },
    { value: 'MySQL', viewValue: 'MySQL' },
    { value: 'TGDB', viewValue: 'TGDB' },
    { value: 'Dgraph', viewValue: 'Dgraph' }
  ];

  @Input() dataStoreForm: FormGroup;

  constructor(private graphService: GraphService) {
    
  }

  ngOnInit() {
    this.getDataStores(this.dataStoreForm.get('gateway').value);

    this.onFormChanges();
  }

  public getDataStores(gatewayId: string) {
    console.log("Getting data stores for: ", gatewayId);

    this.graphService.getDataStores(gatewayId)
      .subscribe(res => {
        console.log("Received response for graphService.getDataStores: ", res);
        this.dataStores = res as DataStore[];

      })
  }


  onDataStoreSelected(event) {
    console.log("Option selected: ", event);

    let dataStore = this.dataStores[event.value];

    console.log("Selected data store: ", dataStore.dataStoreType);

    this.postgresDataStore = false;
    this.snowflakeDataStore = false;
    this.oracleDataStore = false;
    this.mysqlDataStore = false;
    this.tgdbDataStore = false;
    this.dgraphDataStore = false;

    if (dataStore.dataStoreType == "Postgres") {

      this.dataStoreForm.patchValue({
        uid: dataStore.uid,
        dataStore: dataStore.dataStoreType,
        postgres: {
          host: dataStore.host,
          port: dataStore.port,
          databaseName: dataStore.databaseName,
          user: dataStore.user,
          password: dataStore.password
        },
        snowflake: {
          accountName: 'changeme',
          warehouse: 'changeme',
          database: 'changeme',
          schema: 'changeme',
          authType: 'Basic Authentication',
          username: 'changeme',
          password: 'changeme',
          role: 'changeme',
          clientId: '',
          clientSecret: '',
          authorizationCode: '',
          redirectURI: '',
          loginTimeout: '20'
        },
        tgdb: {
          url: 'changeme',
          username: 'changeme',
          password: 'changeme'
        },
        dgraph: {
          url: 'changeme',
          username: 'changeme',
          password: 'changeme'
        }
      });

      this.postgresDataStore = true;
    }
    else if (dataStore.dataStoreType == "Snowflake") {

      this.dataStoreForm.patchValue({
        uid: dataStore.uid,
        dataStore: dataStore.dataStoreType,
        snowflake: {
          accountName: dataStore.accountName,
          warehouse: dataStore.warehouse,
          database: dataStore.database,
          schema: dataStore.schema,
          authType: dataStore.authType,
          username: dataStore.username,
          password: dataStore.password,
          role: dataStore.role,
          clientId: dataStore.clientId,
          clientSecret: dataStore.clientSecret,
          authorizationCode: dataStore.authorizationCode,
          redirectURI: dataStore.redirectURI,
          loginTimeout: dataStore.loginTimeout
        },
        postgres: {
          host: 'changeme',
          port: 'changeme',
          databaseName: 'changeme',
          user: 'changeme',
          password: 'changeme'
        },
        tgdb: {
          url: 'changeme',
          username: 'changeme',
          password: 'changeme'
        },
        dgraph: {
          url: 'changeme',
          username: 'changeme',
          password: 'changeme'
        }
      });

      this.snowflakeDataStore = true;
    }
    else if (dataStore.dataStoreType == "TGDB") {

      this.dataStoreForm.patchValue({
        uid: dataStore.uid,
        dataStore: dataStore.dataStoreType,
        tgdb: {
          url: dataStore.url,
          username: dataStore.username,
          password: dataStore.password
        },
        postgres: {
          host: 'changeme',
          port: 'changeme',
          databaseName: 'changeme',
          user: 'changeme',
          password: 'changeme'
        },
        snowflake: {
          accountName: 'changeme',
          warehouse: 'changeme',
          database: 'changeme',
          schema: 'changeme',
          authType: 'Basic Authentication',
          username: 'changeme',
          password: 'changeme',
          role: 'changeme',
          clientId: '',
          clientSecret: '',
          authorizationCode: '',
          redirectURI: '',
          loginTimeout: '20'
        },
        dgraph: {
          url: 'changeme',
          username: 'changeme',
          password: 'changeme'
        }
      });

      this.tgdbDataStore = true;
    }
    else if (dataStore.dataStoreType == "Dgraph") {

      this.dataStoreForm.patchValue({
        uid: dataStore.uid,
        dataStore: dataStore.dataStoreType,
        dgraph: {
          url: dataStore.url,
          username: dataStore.username,
          password: dataStore.password
        },
        postgres: {
          host: 'changeme',
          port: 'changeme',
          databaseName: 'changeme',
          user: 'changeme',
          password: 'changeme'
        },
        snowflake: {
          accountName: 'changeme',
          warehouse: 'changeme',
          database: 'changeme',
          schema: 'changeme',
          authType: 'Basic Authentication',
          username: 'changeme',
          password: 'changeme',
          role: 'changeme',
          clientId: '',
          clientSecret: '',
          authorizationCode: '',
          redirectURI: '',
          loginTimeout: '20'
        },
        tgdb: {
          url: 'changeme',
          username: 'changeme',
          password: 'changeme'
        }
      });

      console.log("Set to display Dgraph: ", dataStore);
      
      this.dgraphDataStore = true;
    }

  }

  stepSubmitted() {
    // this.dataStoreForm.get('dataStore').markAsTouched();
    // this.dataStoreForm.get('dataStore').updateValueAndValidity();
    // this.transportForm.get('personalDetails').get('lastname').markAsTouched();
    // this.transportForm.get('personalDetails').get('lastname').updateValueAndValidity();
  }

  onFormChanges(): void {
    this.dataStoreForm.valueChanges.subscribe(val => {

      if (this.dataStoreForm.get('dataStore').value == "") {

        this.postgresDataStore = false;
        this.snowflakeDataStore = false;
        this.oracleDataStore = false;
        this.mysqlDataStore = false;
        this.tgdbDataStore = false;
        this.dgraphDataStore = false;
      }

    });
  }

}
