import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { GraphService } from '../../../services/graph/graph.service';
import { DataStore } from '../../../shared/models/iot.model';

@Component({
  selector: 'app-pipeline-data-store',
  templateUrl: './pipeline-data-store.component.html',
  styleUrls: ['./pipeline-data-store.component.css']
})
export class PipelineDataStoreComponent implements OnInit {

  @Input() dataStoreForm: FormGroup;

  hidePassword = true;

  postgresDataStore = false;
  snowflakeDataStore = false;
  oracleDataStore = false;
  mysqlDataStore = false;
  tgdbDataStore = false;
  dgraphDataStore = false;

  dataStores: DataStore[];

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

        let currentDataStore = this.dataStoreForm.get('dataStoreId').value;    
        if (currentDataStore == '') {
          this.postgresDataStore = false;
          this.snowflakeDataStore = false;
          this.oracleDataStore = false;
          this.mysqlDataStore = false;
          this.tgdbDataStore = false;
          this.dgraphDataStore = false;
        }
        else {
          let dataStore = this.getDataStoreById(currentDataStore);
          this.setForm(dataStore);
        }


      })
  }


  onDataStoreSelected(event) {
    console.log("Option selected: ", event);

    let dataStore = this.getDataStoreById(event.value);

    this.setForm(dataStore);

  }

  getDataStoreById(id) {
    let dataStore = null;

    for (let i = 0; i < this.dataStores.length; i++) {
      if (this.dataStores[i].uuid == id) {
        dataStore = this.dataStores[i];
        break;
      }
    }

    return dataStore;
  }

  setForm(dataStore) {
    console.log("Selected data store: ", dataStore.dataStoreType);

    this.postgresDataStore = false;
    this.snowflakeDataStore = false;
    this.oracleDataStore = false;
    this.mysqlDataStore = false;
    this.tgdbDataStore = false;
    this.dgraphDataStore = false;

    if (dataStore.dataStoreType == "PostgreSQL") {

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
