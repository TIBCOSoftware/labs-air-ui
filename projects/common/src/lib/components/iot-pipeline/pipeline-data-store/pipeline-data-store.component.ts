import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataStore } from '@TIBCOSoftware/labs-air-graph-client';
import { GraphService } from '@TIBCOSoftware/labs-air-graph-client';
import { debounceTime, Subscription, distinctUntilChanged } from 'rxjs';

export interface SelectItem {
    value: string;
    viewValue: string;
}

@Component({
    selector: 'app-common-pipeline-data-store',
    templateUrl: './pipeline-data-store.component.html',
    styleUrls: ['./pipeline-data-store.component.css']
})
export class PipelineDataStoreComponent implements OnInit, OnDestroy {

    dataStoreForm: FormGroup;
    dataOptionsForm: FormGroup;
    formChangeSubscription: Subscription;
    @Input() dataStore: any;
    @Input() gatewayId: string;
    @Output() formUpdatedEvent = new EventEmitter<DataStore>();

    logLevels: SelectItem[] = [
        { value: 'INFO', viewValue: 'INFO' },
        { value: 'WARN', viewValue: 'WARN' },
        { value: 'ERROR', viewValue: 'ERROR' },
        { value: 'DEBUG', viewValue: 'DEBUG' }
    ];

    hidePassword = true;

    postgresDataStore = false;
    snowflakeDataStore = false;
    oracleDataStore = false;
    mysqlDataStore = false;
    tgdbDataStore = false;
    dgraphDataStore = false;

    dataStores: DataStore[];

    constructor(private graphService: GraphService, private formBuilder: FormBuilder) {

    }

    ngOnInit() {
        this.initForm();
        this.getDataStores(this.dataStoreForm.get('gateway').value);
        this.onFormChanges();
        if (this.dataStore) {
            this.updateDataStoreForm(this.dataStore.data['customdata'])
        }
    }

    ngOnDestroy(): void {
        this.formChangeSubscription.unsubscribe()
    }

    public getDataStores(gatewayId: string) {
        console.log('Getting data stores for: ', gatewayId);

        this.graphService.getDataStores(gatewayId)
            .subscribe(res => {
                console.log('Received response for graphService.getDataStores: ', res);
                this.dataStores = res as DataStore[];

                const currentDataStore = this.dataStoreForm.get('dataStoreId').value;
                if (currentDataStore == '') {
                    this.postgresDataStore = false;
                    this.snowflakeDataStore = false;
                    this.oracleDataStore = false;
                    this.mysqlDataStore = false;
                    this.tgdbDataStore = false;
                    this.dgraphDataStore = false;
                }
                else {
                    const dataStore = this.getDataStoreById(currentDataStore);
                    this.setForm(dataStore);
                }


            });
    }


    onDataStoreSelected(event) {
        console.log('Option selected: ', event);

        const dataStore = this.getDataStoreById(event.value);

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
        console.log('Selected data store: ', dataStore.dataStoreType);

        this.postgresDataStore = false;
        this.snowflakeDataStore = false;
        this.oracleDataStore = false;
        this.mysqlDataStore = false;
        this.tgdbDataStore = false;
        this.dgraphDataStore = false;

        if (dataStore.dataStoreType == 'PostgreSQL2') {

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
        else if (dataStore.dataStoreType == 'Snowflake') {

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
        else if (dataStore.dataStoreType == 'TGDB') {

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
        else if (dataStore.dataStoreType == 'Dgraph') {

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

            console.log('Set to display Dgraph: ', dataStore);

            this.dgraphDataStore = true;
        }
    }

    onFormChanges(): void {
        this.formChangeSubscription = this.dataStoreForm.valueChanges
        .pipe(
            debounceTime(500),
            distinctUntilChanged()
        )
        .subscribe(val => {

            if (this.dataStoreForm.get('dataStore').value == '') {

                this.postgresDataStore = false;
                this.snowflakeDataStore = false;
                this.oracleDataStore = false;
                this.mysqlDataStore = false;
                this.tgdbDataStore = false;
                this.dgraphDataStore = false;
            }

            this.formUpdatedEvent.emit(this.dataStoreForm.value);
        });
    }

    initForm() {
        this.dataStoreForm = this.formBuilder.group({
            uid: ['changeme', Validators.required],
            gateway: [this.gatewayId, Validators.required],
            dataStoreId: ['', Validators.required],
            dataStore: ['', Validators.required],
            logLevel: ['INFO', Validators.required],
            postgres: this.formBuilder.group({
                host: ['changeme', Validators.required],
                port: ['changeme', Validators.required],
                databaseName: ['changeme', Validators.required],
                user: ['changeme', Validators.required],
                password: ['changeme', Validators.required]
            }),
            snowflake: this.formBuilder.group({
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
                url: ['changeme', Validators.required],
                username: ['changeme', Validators.required],
                password: ['changeme', Validators.required]
            }),
            tgdb: this.formBuilder.group({
                url: ['changeme', Validators.required],
                username: ['changeme', Validators.required],
                password: ['changeme', Validators.required]
            })
        });

        this.dataOptionsForm = this.formBuilder.group({
            useReading: [true],
            encodeReadingValue: [false],
            useEnrichedReading: [false],
            encodeEnrichedReadingValue: [false]
        });
    }

    updateDataStoreForm(context) {

        if (context != null || context != undefined) {
            console.log('Updating dataStoreform with context: ', context);

            const dataStoreId = context.dataStoreId;
            const dataStore = context.dataStore;

            // Update datastore form
            console.log('Setting datastore form datastore to: ', dataStore);

            if (dataStore == 'PostgreSQL2') {

                this.dataStoreForm.patchValue({
                    dataStoreId: dataStoreId,
                    dataStore: dataStore,
                    logLevel: context.logLevel,
                    postgres: {
                        host: context.host,
                        port: context.port,
                        databaseName: context.databaseName,
                        user: context.user,
                        password: context.password
                    }
                });

            }
            else if (dataStore == 'Snowflake') {

                this.dataStoreForm.patchValue({
                    dataStoreId: dataStoreId,
                    dataStore: dataStore,
                    logLevel: context.logLevel,
                    snowflake: {
                        accountName: context.accountName,
                        warehouse: context.warehouse,
                        database: context.database,
                        schema: context.schema,
                        authType: context.authType,
                        username: context.username,
                        password: context.password,
                        role: context.role,
                        clientId: context.clientId,
                        clientSecret: context.clientSecret,
                        authorizationCode: context.authorizationCode,
                        redirectURI: context.redirectURI,
                        loginTimeout: context.loginTimeout
                    }
                });
            }
            else if (dataStore == 'TGDB') {

                this.dataStoreForm.patchValue({
                    dataStoreId: dataStoreId,
                    dataStore: dataStore,
                    logLevel: context.logLevel,
                    tgdb: {
                        url: context.url,
                        username: context.username,
                        password: context.password
                    }
                });
            }
            else if (dataStore == 'Dgraph') {

                this.dataStoreForm.patchValue({
                    dataStoreId: dataStoreId,
                    dataStore: dataStore,
                    logLevel: context.logLevel,
                    dgraph: {
                        url: context.url,
                        username: context.username,
                        password: context.password
                    }
                });
            }

        }
    }
}
