import { Component, OnInit, Input, AfterViewInit, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { DataStore, Gateway } from '../../../shared/models/iot.model';
import { GraphService } from '../../../services/graph/graph.service';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';


export interface SelectItem {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-ige-data-stores',
  templateUrl: './ige-data-stores.component.html',
  styleUrls: ['./ige-data-stores.component.css']
})
export class IgeDataStoresComponent implements OnInit {

  hidePassword = true;
  dateFormat = 'yyyy-MM-dd  HH:mm:ss'

  // Form variables
  dataStoreForm!: FormGroup;

  postgresDataStore = false;
  snowflakeDataStore = false;
  oracleDataStore = false;
  mysqlDataStore = false;
  tgdbDataStore = false;
  dgraphDataStore = false;

  graphAddOpDisabled = true;
  graphUpdateOpDisabled = true;
  graphDeleteOpDisabled = true;

  dataStoresDataSource = new MatTableDataSource<DataStore>();
  dataStoreDisplayedColumns: string[] = ['id', 'name', 'dataStore', 'scope', 'created', 'modified'];
  dataStoreSelection = new SelectionModel<DataStore>(false, []);

  dataStores: SelectItem[] = [
    { value: 'PostgreSQL', viewValue: 'PostgreSQL' },
    { value: 'Snowflake', viewValue: 'Snowflake' },
    { value: 'Oracle', viewValue: 'Oracle' },
    { value: 'MySQL', viewValue: 'MySQL' },
    { value: 'TGDB', viewValue: 'TGDB' },
    { value: 'Dgraph', viewValue: 'Dgraph' }
  ];

  scopes: SelectItem[] = [
    { value: 'GLOBAL', viewValue: 'GLOBAL' },
    { value: 'GATEWAY', viewValue: 'GATEWAY' }
  ];

  @ViewChild(MatSort, { static: false }) sort: MatSort;

  @Input() gatewayId: string;

  /**
   *
   * @param graphService
   * @param formBuilder
   * @param _snackBar
   */
  constructor(private graphService: GraphService,
    private formBuilder: FormBuilder,
    private _snackBar: MatSnackBar) { }

  ngOnInit() {

    this.dataStoreSelection.clear();

    this.createForm();

    this.onFormChanges();

    console.log("Getting dataStores");

    this.getDataStores(this.gatewayId);
  }


  /**
   *
   */
  ngAfterViewInit() {
    this.dataStoresDataSource.sort = this.sort;
  }

  /**
   *
   * @param filterValue
   */
  applyFilter(target: EventTarget |null) {
    if(target){
      let htmlTextArea = target as HTMLTextAreaElement;
      this.dataStoresDataSource.filter = htmlTextArea.value.trim().toLowerCase();}
  }

  /**
 * Create forms to add pipelines as well as form to view pipeline information
 */
  createForm() {

    this.dataStoreForm = this.formBuilder.group({
      uid: ['changeme', Validators.required],
      dataStoreType: ['', Validators.required],
      scope: ['GLOBAL', Validators.required],
      postgres: this.formBuilder.group({
        uuid: ['changeme', Validators.required],
        host: ['changeme', Validators.required],
        port: ['0', Validators.required],
        databaseName: ['changeme', Validators.required],
        user: ['changeme', Validators.required],
        password: ['changeme', Validators.required]
      }),
      snowflake: this.formBuilder.group({
        uuid: ['changeme', Validators.required],
        accountName: ['changeme', Validators.required],
        warehouse: ['changeme', Validators.required],
        database: ['changeme', Validators.required],
        schema: ['changeme', Validators.required],
        authType: ['Basic Authentication', Validators.required],
        username: ['changeme', Validators.required],
        password: ['changeme', Validators.required],
        role: ['changeme', Validators.required],
        clientId: [''],
        clientSecret: [''],
        authorizationCode: [''],
        redirectURI: [''],
        loginTimeout: ['20', Validators.required]
      }),
      dgraph: this.formBuilder.group({
        uuid: ['changeme', Validators.required],
        url: ['changeme', Validators.required],
        username: ['changeme', Validators.required],
        password: ['changeme', Validators.required]
      }),
      tgdb: this.formBuilder.group({
        uuid: ['changeme', Validators.required],
        url: ['changeme', Validators.required],
        username: ['changeme', Validators.required],
        password: ['changeme', Validators.required]
      })
    });

  }

  /**
   * Gets a gateway and all the data stores associated with it
   * @param gatewayId - the gateway identifier
   */
  public getDataStores(gatewayId: string) {
    console.log("Getting data stores for: ", gatewayId);

    this.graphService.getDataStores(gatewayId)
      .subscribe(res => {
        console.log("Received response for graphService.getDataStores: ", res);
        this.dataStoresDataSource.data = res as DataStore[];

        this.graphAddOpDisabled = true;
        this.graphUpdateOpDisabled = true;
        this.graphDeleteOpDisabled = true;
      })
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    // const numSelected = this.dataStoreSelection.selected.length;
    // const numRows = this.dataStoresDataSource.data.length;
    // return numSelected === numRows;
    return false;
  }


  /**
   * Function called when a dataStore table row is selected
   * @param row - the table row object. It maps to a DataStore object.
   */
  onDataStoreClicked(row:any) {

    console.log('Row clicked: ', row);

    this.dataStoreSelection.select(row);

    this.postgresDataStore = false;
    this.snowflakeDataStore = false;
    this.oracleDataStore = false;
    this.mysqlDataStore = false;
    this.tgdbDataStore = false;
    this.dgraphDataStore = false;

    let dataStore = row;

    let scope = dataStore.scope;
    if (scope != "GLOBAL") {
      scope = "GATEWAY";
    }

    // Update form
    if (dataStore.dataStoreType == "PostgreSQL") {

      this.dataStoreForm.patchValue({
        uid: dataStore.uid,
        dataStoreType: dataStore.dataStoreType,
        scope: scope,
        postgres: {
          uuid: dataStore.uuid,
          host: dataStore.host,
          port: dataStore.port,
          databaseName: dataStore.databaseName,
          user: dataStore.user,
          password: dataStore.password
        }
      });

      this.postgresDataStore = true;

    }
    else if (dataStore.dataStoreType == "Snowflake") {

      this.dataStoreForm.patchValue({
        uid: dataStore.uid,
        dataStoreType: dataStore.dataStoreType,
        scope: scope,
        snowflake: {
          uuid: dataStore.uuid,
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
        }
      });

      this.snowflakeDataStore = true;
    }
    else if (dataStore.dataStoreType == "Dgraph") {

      this.dataStoreForm.patchValue({
        uid: dataStore.uid,
        dataStoreType: dataStore.dataStoreType,
        scope: scope,
        dgraph: {
          uuid: dataStore.uuid,
          url: dataStore.url,
          username: dataStore.username,
          password: dataStore.password
        }
      });

      this.dgraphDataStore = true;
    }
    else if (dataStore.dataStoreType == "TGDB") {

      this.dataStoreForm.patchValue({
        uid: dataStore.uid,
        dataStoreType: dataStore.dataStoreType,
        scope: scope,
        dgraph: {
          uuid: dataStore.uuid,
          url: dataStore.url,
          username: dataStore.username,
          password: dataStore.password
        }
      });

      this.tgdbDataStore = true;
    }

    this.graphDeleteOpDisabled = false;
    this.graphAddOpDisabled = true;
    this.graphUpdateOpDisabled = true;
  }

  /**
   * Reset dataStore form
   */
  resetDataStoreForm() {
    this.dataStoreForm.reset({
    }, { emitEvent: false });

    this.graphDeleteOpDisabled = true;
    this.graphAddOpDisabled = true;
    this.graphUpdateOpDisabled = true;

    this.postgresDataStore = false;
    this.snowflakeDataStore = false;
    this.oracleDataStore = false;
    this.mysqlDataStore = false;
    this.tgdbDataStore = false;
    this.dgraphDataStore = false;

    this.dataStoreSelection.clear();
  }

  /**
   * Add a dataStore object to the graph data store
   */
  addDataStore() {

    let ts = Date.now();
    let dataStore = new DataStore();

    let scope = this.dataStoreForm.get('scope').value;
    if (scope != "GLOBAL") {
      scope = this.gatewayId;
    }
    dataStore.scope = scope;

    let dataStoreType = this.dataStoreForm.get('dataStoreType').value;

    if (dataStoreType == "PostgreSQL") {

      dataStore.created = ts;
      dataStore.modified = ts;
      dataStore.uuid = this.dataStoreForm.get('postgres.uuid').value;
      dataStore.dataStoreType = dataStoreType;
      dataStore.host = this.dataStoreForm.get('postgres.host').value;
      dataStore.port = this.dataStoreForm.get('postgres.port').value;
      dataStore.databaseName = this.dataStoreForm.get('postgres.databaseName').value;
      dataStore.user = this.dataStoreForm.get('postgres.user').value;
      dataStore.password = this.dataStoreForm.get('postgres.password').value;
      dataStore.accountName = '';
      dataStore.warehouse = '';
      dataStore.database = '';
      dataStore.schema = '';
      dataStore.authType = '';
      dataStore.username = '';
      dataStore.role = '';
      dataStore.clientId = '';
      dataStore.clientSecret = '';
      dataStore.authorizationCode = '';
      dataStore.redirectURI = '';
      dataStore.loginTimeout = '';
      dataStore.url = '';
    }
    else if (dataStoreType == "Snowflake") {

      dataStore.created = ts;
      dataStore.modified = ts;
      dataStore.dataStoreType = dataStoreType;
      dataStore.uuid = this.dataStoreForm.get('snowflake.uuid').value;
      dataStore.host = '';
      dataStore.port = '0';
      dataStore.databaseName = '';
      dataStore.user = '';
      dataStore.password = this.dataStoreForm.get('snowflake.password').value;
      dataStore.accountName = this.dataStoreForm.get('snowflake.accountName').value;
      dataStore.warehouse = this.dataStoreForm.get('snowflake.warehouse').value;
      dataStore.database = this.dataStoreForm.get('snowflake.database').value;
      dataStore.schema = this.dataStoreForm.get('snowflake.schema').value;
      dataStore.authType = this.dataStoreForm.get('snowflake.authType').value;
      dataStore.username = this.dataStoreForm.get('snowflake.username').value;
      dataStore.role = this.dataStoreForm.get('snowflake.role').value;
      dataStore.clientId = this.dataStoreForm.get('snowflake.clientId').value;
      dataStore.clientSecret = this.dataStoreForm.get('snowflake.clientSecret').value;
      dataStore.authorizationCode = this.dataStoreForm.get('snowflake.authorizationCode').value;
      dataStore.redirectURI = this.dataStoreForm.get('snowflake.redirectURI').value;
      dataStore.loginTimeout = this.dataStoreForm.get('snowflake.loginTimeout').value;
      dataStore.url = '';
    }
    else if (dataStoreType == "TGDB") {

      dataStore.created = ts;
      dataStore.modified = ts;
      dataStore.dataStoreType = dataStoreType;
      dataStore.uuid = this.dataStoreForm.get('tgdb.uuid').value;
      dataStore.host = '';
      dataStore.port = '0';
      dataStore.databaseName = '';
      dataStore.user = '';
      dataStore.password = this.dataStoreForm.get('tgdb.password').value;
      dataStore.accountName = '';
      dataStore.warehouse = '';
      dataStore.database = '';
      dataStore.schema = '';
      dataStore.authType = '';
      dataStore.username = this.dataStoreForm.get('tgdb.username').value;
      dataStore.clientId = '';
      dataStore.clientSecret = '';
      dataStore.authorizationCode = '';
      dataStore.redirectURI = '';
      dataStore.loginTimeout = '';
      dataStore.url = this.dataStoreForm.get('tgdb.url').value;
    }
    else if (dataStoreType == "Dgraph") {

      dataStore.created = ts;
      dataStore.modified = ts;
      dataStore.dataStoreType = dataStoreType;
      dataStore.uuid = this.dataStoreForm.get('dgraph.uuid').value;
      dataStore.host = '';
      dataStore.port = '0';
      dataStore.databaseName = '';
      dataStore.user = '';
      dataStore.password = this.dataStoreForm.get('dgraph.password').value;
      dataStore.accountName = '';
      dataStore.warehouse = '';
      dataStore.database = '';
      dataStore.schema = '';
      dataStore.authType = '';
      dataStore.username = this.dataStoreForm.get('dgraph.username').value;
      dataStore.clientId = '';
      dataStore.clientSecret = '';
      dataStore.authorizationCode = '';
      dataStore.redirectURI = '';
      dataStore.loginTimeout = '';
      dataStore.url = this.dataStoreForm.get('dgraph.url').value;
    };

    // First check that data store with the same name already exist
    if (this.dataStoreExist(dataStore.uuid)) {

      this._snackBar.open("Data store name is not unique.", "Cancel", {
        duration: 3000,
      });
    }
    else {
      this.graphService.addDataStore(0, dataStore)
      .subscribe(res => {
        console.log("Result from add dataStore", res);

        this.getDataStores(this.gatewayId);
        this.resetDataStoreForm();
      });
    }
  }

  /**
   * Updates the dataStore on the graph data store
   */
  updateDataStore() {

    console.log("Inside updateDataStore function");

    let ts = Date.now();
    let dataStore = new DataStore();
    dataStore.uid = this.dataStoreForm.get('uid').value;

    // First Check if there are pipelines associated with the data store
    this.graphService.getPipelineIdsFromDataStoreUid(dataStore.uid)
      .subscribe(res => {
        console.log("Received response for graphService.getPipelineIdsFromDataStoreUid: ", res);

        if (res.length > 0) {

          console.log("Can't delete data store.  Pipelines need to be deleted first");
          this._snackBar.open("Pipelines are associated with this data store.  Can't be deleted", "Cancel", {
            duration: 5000,
          });
          this.resetDataStoreForm();
        }
        else {

          let dataStoreType = this.dataStoreForm.get('dataStoreType').value;

          let scope = this.dataStoreForm.get('scope').value;
          if (scope != "GLOBAL") {
            scope = this.gatewayId;
          }
          dataStore.scope = scope;

          let uuidDirty = false;

          if (dataStoreType == "PostgreSQL") {

            dataStore.created = ts;
            dataStore.modified = ts;
            dataStore.uuid = this.dataStoreForm.get('postgres.uuid').value;
            dataStore.dataStoreType = dataStoreType;
            dataStore.host = this.dataStoreForm.get('postgres.host').value;
            dataStore.port = this.dataStoreForm.get('postgres.port').value;
            dataStore.databaseName = this.dataStoreForm.get('postgres.databaseName').value;
            dataStore.user = this.dataStoreForm.get('postgres.user').value;
            dataStore.password = this.dataStoreForm.get('postgres.password').value;
            dataStore.accountName = '';
            dataStore.warehouse = '';
            dataStore.database = '';
            dataStore.schema = '';
            dataStore.authType = '';
            dataStore.username = '';
            dataStore.role = '';
            dataStore.clientId = '';
            dataStore.clientSecret = '';
            dataStore.authorizationCode = '';
            dataStore.redirectURI = '';
            dataStore.loginTimeout = '';
            dataStore.url = '';
          }
          else if (dataStoreType == "Snowflake") {

            dataStore.created = ts;
            dataStore.modified = ts;
            dataStore.dataStoreType = dataStoreType;
            dataStore.uuid = this.dataStoreForm.get('snowflake.uuid').value;
            dataStore.host = '';
            dataStore.port = '0';
            dataStore.databaseName = '';
            dataStore.user = '';
            dataStore.password = this.dataStoreForm.get('snowflake.password').value;
            dataStore.accountName = this.dataStoreForm.get('snowflake.accountName').value;
            dataStore.warehouse = this.dataStoreForm.get('snowflake.warehouse').value;
            dataStore.database = this.dataStoreForm.get('snowflake.database').value;
            dataStore.schema = this.dataStoreForm.get('snowflake.schema').value;
            dataStore.authType = this.dataStoreForm.get('snowflake.authType').value;
            dataStore.username = this.dataStoreForm.get('snowflake.username').value;
            dataStore.role = this.dataStoreForm.get('snowflake.role').value;
            dataStore.clientId = this.dataStoreForm.get('snowflake.clientId').value;
            dataStore.clientSecret = this.dataStoreForm.get('snowflake.clientSecret').value;
            dataStore.authorizationCode = this.dataStoreForm.get('snowflake.authorizationCode').value;
            dataStore.redirectURI = this.dataStoreForm.get('snowflake.redirectURI').value;
            dataStore.loginTimeout = this.dataStoreForm.get('snowflake.loginTimeout').value;
            dataStore.url = '';
          }
          else if (dataStoreType == "TGDB") {

            dataStore.created = ts;
            dataStore.modified = ts;
            dataStore.dataStoreType = dataStoreType;
            dataStore.uuid = this.dataStoreForm.get('tgdb.uuid').value;
            dataStore.host = '';
            dataStore.port = '0';
            dataStore.databaseName = '';
            dataStore.user = '';
            dataStore.password = this.dataStoreForm.get('tgdb.password').value;
            dataStore.accountName = '';
            dataStore.warehouse = '';
            dataStore.database = '';
            dataStore.schema = '';
            dataStore.authType = '';
            dataStore.username = this.dataStoreForm.get('tgdb.username').value;
            dataStore.clientId = '';
            dataStore.clientSecret = '';
            dataStore.authorizationCode = '';
            dataStore.redirectURI = '';
            dataStore.loginTimeout = '';
            dataStore.url = this.dataStoreForm.get('tgdb.url').value;
          }
          else if (dataStoreType == "Dgraph") {
            dataStore.created = ts;
            dataStore.modified = ts;
            dataStore.dataStoreType = dataStoreType;
            dataStore.uuid = this.dataStoreForm.get('dgraph.uuid').value;
            dataStore.host = '';
            dataStore.port = '0';
            dataStore.databaseName = '';
            dataStore.user = '';
            dataStore.password = this.dataStoreForm.get('dgraph.password').value;
            dataStore.accountName = '';
            dataStore.warehouse = '';
            dataStore.database = '';
            dataStore.schema = '';
            dataStore.authType = '';
            dataStore.username = this.dataStoreForm.get('dgraph.username').value;
            dataStore.clientId = '';
            dataStore.clientSecret = '';
            dataStore.authorizationCode = '';
            dataStore.redirectURI = '';
            dataStore.loginTimeout = '';
            dataStore.url = this.dataStoreForm.get('dgraph.url').value;
          }

          this.graphService.updateDataStore(dataStore)
            .subscribe(res => {
              console.log("Result from update dataStore", res);

              this.getDataStores(this.gatewayId);
              this.resetDataStoreForm();
            });

        }
      });

  }

  /**
   * Deletes the dataStore from the graph data store
   */
  deleteDataStore() {
    let dataStoreUid = this.dataStoreForm.get('uid').value;
    console.log("deleting dataStore: ", dataStoreUid);

    // First Check if there are pipelines associated with the data store
    this.graphService.getPipelineIdsFromDataStoreUid(dataStoreUid)
      .subscribe(res => {
        console.log("Received response for graphService.getPipelineIdsFromDataStoreUid: ", res);

        if (res.length > 0) {

          console.log("Can't delete data store.  Pipelines need to be deleted first");
          this._snackBar.open("Pipelines are associated with this data store.  Can't be deleted", "Cancel", {
            duration: 5000,
          });
          this.resetDataStoreForm();
        }
        else {

          this.graphService.deleteDataStore(0, this.dataStoreForm.get('uid').value)
            .subscribe(res => {
              console.log("Result from delete dataStore ", res);

              this.getDataStores(this.gatewayId);
              this.resetDataStoreForm();

            });
        }
      });
  }

  /**
   * Fucntion called when the form changes
   */
  onFormChanges(): void {
    this.dataStoreForm.valueChanges.subscribe(val => {

      if (this.dataStoreForm.dirty) {

        this.graphDeleteOpDisabled = true;
        this.graphAddOpDisabled = false;

        if (this.dataStoreSelection.hasValue()) {
          this.graphUpdateOpDisabled = false;
        }
        else {
          this.graphUpdateOpDisabled = true;
        }
      }

    });
  }

  /**
   * Function called when the  data store selector is changed on the data store form
   * @param event
   */
  onDataStoreSelected(event) {
    console.log("Option selected: ", event);

    this.postgresDataStore = false;
    this.snowflakeDataStore = false;
    this.oracleDataStore = false;
    this.mysqlDataStore = false;
    this.tgdbDataStore = false;
    this.dgraphDataStore = false;

    if (event.value == "PostgreSQL") {

      this.dataStoreForm.patchValue({
        postgres: {
          uuid: '',
          host: '',
          port: '',
          databaseName: '',
          user: '',
          password: ''
        },
        snowflake: {
          uuid: 'changeme',
          accountName: 'changeme',
          warehouse: 'changeme',
          database: 'changeme',
          schema: 'changeme',
          authType: 'changeme',
          username: 'changeme',
          password: 'changeme',
          role: 'changeme',
          clientId: 'changeme',
          clientSecret: 'changeme',
          authorizationCode: 'changeme',
          redirectURI: 'changeme',
          loginTimeout: 'changeme'
        },
        tgdb: {
          uuid: 'changeme',
          url: 'changeme',
          username: 'changeme',
          password: 'changeme'
        },
        dgraph: {
          uuid: 'changeme',
          url: 'changeme',
          username: 'changeme',
          password: 'changeme'
        }
      });

      this.postgresDataStore = true;
    }
    else if (event.value == "Snowflake") {

      this.dataStoreForm.patchValue({
        snowflake: {
          uuid: '',
          accountName: '',
          warehouse: '',
          database: '',
          schema: '',
          authType: 'Basic Authentication',
          username: '',
          password: '',
          role: '',
          clientId: '',
          clientSecret: '',
          authorizationCode: '',
          redirectURI: '',
          loginTimeout: '20'
        },
        postgres: {
          uuid: 'changeme',
          host: 'changeme',
          port: '0',
          databaseName: 'changeme',
          user: 'changeme',
          password: 'changeme'
        },
        tgdb: {
          uuid: 'changeme',
          url: 'changeme',
          username: 'changeme',
          password: 'changeme'
        },
        dgraph: {
          uuid: 'changeme',
          url: 'changeme',
          username: 'changeme',
          password: 'changeme'
        }
      });

      this.snowflakeDataStore = true;
    }
    else if (event.value == "TGDB") {

      this.dataStoreForm.patchValue({
        tgdb: {
          uuid: '',
          url: '',
          username: '',
          password: ''
        },
        postgres: {
          uuid: 'changeme',
          host: 'changeme',
          port: '0',
          databaseName: 'changeme',
          user: 'changeme',
          password: 'changeme'
        },
        snowflake: {
          uuid: 'changeme',
          accountName: 'changeme',
          warehouse: 'changeme',
          database: 'changeme',
          schema: 'changeme',
          authType: 'changeme',
          username: 'changeme',
          password: 'changeme',
          role: 'changeme',
          clientId: 'changeme',
          clientSecret: 'changeme',
          authorizationCode: 'changeme',
          redirectURI: 'changeme',
          loginTimeout: 'changeme'
        },
        dgraph: {
          uuid: 'changeme',
          url: 'changeme',
          username: 'changeme',
          password: 'changeme'
        }
      });

      this.tgdbDataStore = true;
    }
    else if (event.value == "Dgraph") {

      this.dataStoreForm.patchValue({
        dgraph: {
          uuid: '',
          url: '',
          username: '',
          password: ''
        },
        postgres: {
          uuid: 'changeme',
          host: 'changeme',
          port: '0',
          databaseName: 'changeme',
          user: 'changeme',
          password: 'changeme'
        },
        snowflake: {
          uuid: 'changeme',
          accountName: 'changeme',
          warehouse: 'changeme',
          database: 'changeme',
          schema: 'changeme',
          authType: 'changeme',
          username: 'changeme',
          password: 'changeme',
          role: 'changeme',
          clientId: 'changeme',
          clientSecret: 'changeme',
          authorizationCode: 'changeme',
          redirectURI: 'changeme',
          loginTimeout: 'changeme'
        },
        tgdb: {
          uuid: 'changeme',
          url: 'changeme',
          username: 'changeme',
          password: 'changeme'
        }
      });

      this.dgraphDataStore = true;
    }
  }

  dataStoreExist(uuid: string): boolean {
    let found = false;

    this.dataStoresDataSource.data.forEach(
      dataStore => {

        if (dataStore.uuid == uuid) {
          found = true;
        }
      }
    );

    return found;
  }

}
