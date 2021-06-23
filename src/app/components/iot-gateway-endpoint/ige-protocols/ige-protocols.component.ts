import { Component, OnInit, Input, AfterViewInit, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { Protocol, Gateway } from '../../../shared/models/iot.model';
import { GraphService } from '../../../services/graph/graph.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

export interface SelectItem {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-ige-protocols',
  templateUrl: './ige-protocols.component.html',
  styleUrls: ['./ige-protocols.component.css']
})
export class IgeProtocolsComponent implements OnInit, AfterViewInit {

  hidePassword = true;
  dateFormat = 'yyyy-MM-dd  HH:mm:ss'

  // Form variables
  protocolForm: FormGroup;

  mqttProtocol = false;
  kafkaProtocol = false;
  amqpProtocol = false;
  httpProtocol = false;

  graphAddOpDisabled = true;
  graphUpdateOpDisabled = true;
  graphDeleteOpDisabled = true;

  protocolsDataSource = new MatTableDataSource<Protocol>();
  protocolDisplayedColumns: string[] = ['id', 'name', 'protocol', 'scope', 'created', 'modified'];
  protocolSelection = new SelectionModel<Protocol>(false, []);

  protocols: SelectItem[] = [
    { value: 'MQTT', viewValue: 'MQTT' },
    { value: 'Kafka', viewValue: 'Kafka' },
    { value: 'AMQP', viewValue: 'AMQP' }
  ];

  scopes: SelectItem[] = [
    { value: 'GLOBAL', viewValue: 'GLOBAL' },
    { value: 'GATEWAY', viewValue: 'GATEWAY' }
  ];

  kafkaAuthModes: SelectItem[] = [
    { value: 'None', viewValue: 'None' },
    { value: 'SASL/Plain', viewValue: 'SASL/Plain' },
    { value: 'SSL', viewValue: 'SSL' }
  ];

  kafkaInitialOffsets: SelectItem[] = [
    { value: 'Oldest', viewValue: 'Oldest' },
    { value: 'Newest', viewValue: 'Newest' }
  ];

  mqttEncriptionModes: SelectItem[] = [
    { value: 'None', viewValue: 'None' },
    { value: 'TLS-Cert', viewValue: 'TLS-Cert' },
    { value: 'TLS-ClientAuth', viewValue: 'TLS-ClientAuth' }
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
    private _snackBar: MatSnackBar) {

  }

  /**
   *
   */
  ngOnInit() {

    this.protocolSelection.clear();

    this.createForm();


    this.onFormChanges();

    console.log("Getting protocols");

    this.getProtocols(this.gatewayId);

  }

  /**
   *
   */
  ngAfterViewInit() {
    this.protocolsDataSource.sort = this.sort;
  }

  /**
   *
   * @param filterValue
   */
   applyFilter(target: EventTarget | null) {
    if (target){
      let htmlTextArea = target as HTMLTextAreaElement;
      this.protocolsDataSource.filter = htmlTextArea.value.trim().toLowerCase();
    }
  }
  /**
   * Creates the protocol form
   */
  createForm() {
    this.protocolForm = this.formBuilder.group({
      uid: ['changeme', Validators.required],
      protocolType: ['', Validators.required],
      scope: ['GLOBAL', Validators.required],
      mqtt: this.formBuilder.group({
        uuid: ['changeme', Validators.required],
        hostname: ['changeme', Validators.required],
        port: ['changeme', Validators.required],
        username: ['changeme', Validators.required],
        password: ['changeme', Validators.required],
        encryptionMode: ['None', Validators.required],
        caCertificate: [''],
        clientCertificate: [''],
        clientKey: [''],
        topic: ['changeme', Validators.required],
        maximumQOS: ['2', Validators.required]
      }),
      kafka: this.formBuilder.group({
        uuid: ['changeme', Validators.required],
        hostname: ['changeme', Validators.required],
        port: ['changeme', Validators.required],
        authMode: ['None', Validators.required],
        username: ['changeme', Validators.required],
        password: ['changeme', Validators.required],
        clientCertificate: [''],
        clientKey: [''],
        serverCertificate: [''],
        connectionTimeout: ['30', Validators.required],
        retryBackoff: ['3', Validators.required],
        topic: ['changeme', Validators.required],
        consumerGroupId: ['changeme', Validators.required],
        commitInterval: ['500', Validators.required],
        initialOffset: ['Oldest', Validators.required],
        fetchMinBytes: ['1', Validators.required],
        fetchMaxWait: ['500', Validators.required],
        heartbeatInterval: ['3000', Validators.required],
        sessionTimeout: ['30000', Validators.required]
      }),
      amqp: this.formBuilder.group({
        uuid: ['changeme', Validators.required],
        hostname: ['changeme', Validators.required],
        port: ['changeme', Validators.required],
        username: ['changeme', Validators.required],
        password: ['changeme', Validators.required],
        exchangeName: ['changeme', Validators.required],
        exchangeType: ['topic', Validators.required],
        routingKey: ['air', Validators.required],
        reliable: ['true', Validators.required]
      })
    });
  }

  /**
   * Gets a gateway and all the protocols associated with it
   * @param gatewayId - the gateway identifier
   */
  public getProtocols(gatewayId: string) {
    console.log("Getting protocols for: ", gatewayId);

    this.graphService.getProtocols(gatewayId)
      .subscribe(res => {
        console.log("Received response for graphService.getProtocols: ", res);
        this.protocolsDataSource.data = res as Protocol[];

        this.graphAddOpDisabled = true;
        this.graphUpdateOpDisabled = true;
        this.graphDeleteOpDisabled = true;
      })
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    // const numSelected = this.protocolSelection.selected.length;
    // const numRows = this.protocolsDataSource.data.length;
    // return numSelected === numRows;
    return false;
  }

  /**
   * Function called when a protocol table row is selected
   * @param row - the table row object. It maps to a Protocol object.
   */
  onProtocolClicked(row) {

    console.log('Row clicked: ', row);

    this.protocolSelection.select(row);
    this.mqttProtocol = false;
    this.kafkaProtocol = false;
    this.amqpProtocol = false;
    this.httpProtocol = false;

    let protocol = row;

    let scope = protocol.scope;
    if (scope != "GLOBAL") {
      scope = "GATEWAY";
    }

    // Update form
    if (protocol.protocolType == "MQTT") {
      let delimInd = protocol.brokerURL.lastIndexOf(":");
      let hostname = protocol.brokerURL.substring(6, delimInd);
      let port = protocol.brokerURL.substring(delimInd + 1);

      this.protocolForm.patchValue({
        uid: protocol.uid,
        protocolType: protocol.protocolType,
        scope: scope,
        mqtt: {
          uuid: protocol.uuid,
          hostname: hostname,
          port: port,
          topic: protocol.topic,
          maximumQOS: protocol.maximumQOS,
          connectionTimeout: protocol.connectionTimeout,
          username: protocol.username,
          password: protocol.password,
          encryptionMode: protocol.encryptionMode,
          clientCertificate: protocol.clientCertificate,
          caCertificate: protocol.caCertificate,
          clientKey: protocol.clientKey
        }
      });

      this.mqttProtocol = true;

    }
    else if (protocol.protocolType == "Kafka") {
      let delimInd = protocol.brokerURL.lastIndexOf(":");
      let hostname = protocol.brokerURL.substring(0, delimInd);
      let port = protocol.brokerURL.substring(delimInd + 1);

      this.protocolForm.patchValue({
        uid: protocol.uid,
        protocolType: protocol.protocolType,
        scope: scope,
        kafka: {
          uuid: protocol.uuid,
          hostname: hostname,
          port: port,
          topic: protocol.topic,
          consumerGroupId: protocol.consumerGroupId,
          connectionTimeout: protocol.connectionTimeout,
          sessionTimeout: protocol.sessionTimeout,
          initialOffset: protocol.initialOffset,
          retryBackoff: protocol.retryBackoff,
          fetchMinBytes: protocol.fetchMinBytes,
          fetchMaxWait: protocol.fetchMaxWait,
          commitInterval: protocol.commitInterval,
          heartbeatInterval: protocol.heartbeatInterval,
          authMode: protocol.authMode,
          username: protocol.username,
          password: protocol.password,
          clientCertificate: protocol.clientCertificate,
          serverCertificate: protocol.serverCertificate,
          clientKey: protocol.clientKey
        }
      });

      this.kafkaProtocol = true;

    }
    else if (protocol.protocolType == "AMQP") {
      let delimInd = protocol.brokerURL.lastIndexOf(":");
      let hostname = protocol.brokerURL.substring(0, delimInd);
      let port = protocol.brokerURL.substring(delimInd + 1);

      this.protocolForm.patchValue({
        uid: protocol.uid,
        protocolType: protocol.protocolType,
        scope: scope,
        amqp: {
          uuid: protocol.uuid,
          hostname: hostname,
          port: port,
          username: protocol.username,
          password: protocol.password,
          exchangeName: protocol.topic,
          exchangeType: "topic",
          routingKey: "air",
          reliable: "true"
        }
      });

      this.amqpProtocol = true;

    }

    this.graphDeleteOpDisabled = false;
    this.graphAddOpDisabled = true;
    this.graphUpdateOpDisabled = true;
  }

  /**
   * Reset protocol form
   */
  resetProtocolForm() {
    this.protocolForm.reset({
    }, { emitEvent: false });

    this.graphDeleteOpDisabled = true;
    this.graphAddOpDisabled = true;
    this.graphUpdateOpDisabled = true;

    this.mqttProtocol = false;
    this.kafkaProtocol = false;
    this.amqpProtocol = false;
    this.httpProtocol = false;

    this.protocolSelection.clear();
  }

  /**
   * Add a protocol object to the graph data store
   */
  addProtocol() {
    let ts = Date.now();
    let protocol = new Protocol();

    let scope = this.protocolForm.get('scope').value;
    if (scope != "GLOBAL") {
      scope = this.gatewayId;
    }
    protocol.scope = scope;

    let protocolType = this.protocolForm.get('protocolType').value;

    if (protocolType == "MQTT") {
      protocol.authMode = "";
      protocol.brokerURL = "tcp://" + this.protocolForm.get('mqtt.hostname').value + ":" + this.protocolForm.get('mqtt.port').value;
      protocol.caCerticate = this.protocolForm.get('mqtt.caCertificate').value;
      protocol.clientCertificate = this.protocolForm.get('mqtt.clientCertificate').value;
      protocol.clientKey = this.protocolForm.get('mqtt.clientKey').value;
      protocol.commitInterval = "";
      protocol.connectionTimeout = "";
      protocol.consumerGroupId = "";
      protocol.created = ts;
      protocol.encryptionMode = this.protocolForm.get('mqtt.encryptionMode').value;
      protocol.fetchMaxWait = "";
      protocol.fetchMinBytes = "";
      protocol.heartbeatInterval = "";
      protocol.initialOffset = "";
      protocol.maximumQOS = this.protocolForm.get('mqtt.maximumQOS').value;
      protocol.modified = ts;
      protocol.password = this.protocolForm.get('mqtt.password').value;
      protocol.protocolType = protocolType;
      protocol.retryBackoff = "";
      protocol.serverCertificate = "";
      protocol.sessionTimeout = "";
      protocol.topic = this.protocolForm.get('mqtt.topic').value;
      protocol.username = this.protocolForm.get('mqtt.username').value;
      protocol.uuid = this.protocolForm.get('mqtt.uuid').value;
    }
    else if (protocolType == "Kafka") {
      protocol.authMode = this.protocolForm.get('kafka.authMode').value;
      protocol.brokerURL = this.protocolForm.get('kafka.hostname').value + ":" + this.protocolForm.get('kafka.port').value;
      protocol.caCerticate = "";
      protocol.clientCertificate = this.protocolForm.get('kafka.clientCertificate').value;
      protocol.clientKey = this.protocolForm.get('kafka.clientKey').value;
      protocol.commitInterval = this.protocolForm.get('kafka.commitInterval').value;
      protocol.connectionTimeout = this.protocolForm.get('kafka.connectionTimeout').value;
      protocol.consumerGroupId = this.protocolForm.get('kafka.consumerGroupId').value;
      protocol.created = ts;
      protocol.encryptionMode = "";
      protocol.fetchMaxWait = this.protocolForm.get('kafka.fetchMaxWait').value;
      protocol.fetchMinBytes = this.protocolForm.get('kafka.fetchMinBytes').value;
      protocol.heartbeatInterval = this.protocolForm.get('kafka.heartbeatInterval').value;
      protocol.initialOffset = this.protocolForm.get('kafka.initialOffset').value;
      protocol.maximumQOS = "";
      protocol.modified = ts;
      protocol.password = this.protocolForm.get('kafka.password').value;
      protocol.protocolType = protocolType;
      protocol.retryBackoff = this.protocolForm.get('kafka.retryBackoff').value;
      protocol.serverCertificate = this.protocolForm.get('kafka.serverCertificate').value;
      protocol.sessionTimeout = this.protocolForm.get('kafka.sessionTimeout').value;
      protocol.topic = this.protocolForm.get('kafka.topic').value;
      protocol.username = this.protocolForm.get('kafka.username').value;
      protocol.uuid = this.protocolForm.get('mqtt.uuid').value;
    }
    else if (protocolType == "AMQP") {
      protocol.brokerURL = this.protocolForm.get('amqp.hostname').value + ":" + this.protocolForm.get('amqp.port').value;
      protocol.username = this.protocolForm.get('amqp.username').value;
      protocol.password = this.protocolForm.get('amqp.password').value;
      protocol.created = ts;
      protocol.modified = ts;
      protocol.protocolType = protocolType;
      protocol.topic = this.protocolForm.get('amqp.exchangeName').value;
      protocol.uuid = this.protocolForm.get('amqp.uuid').value;
    }

    // First check that protocol with the same name already exist
    if (this.protocolExist(protocol.uuid)) {

      this._snackBar.open("Protocol name is not unique.", "Cancel", {
        duration: 3000,
      });
    }
    else {
      this.graphService.addProtocol(0, protocol)
        .subscribe(res => {
          console.log("Result from add protocol", res);

          this.getProtocols(this.gatewayId);
          this.resetProtocolForm();
        });
    }

  }

  /**
   * Updates the protocol on the graph data store
   */
  updateProtocol() {

    console.log("Inside updateProtocol function");

    let ts = Date.now();
    let protocol = new Protocol();
    protocol.uid = this.protocolForm.get('uid').value;


    // First Check if there are pipelines associated with the protocol
    this.graphService.getPipelineIdsFromProtocolUid(protocol.uid)
      .subscribe(res => {
        console.log("Received response for graphService.getPipelineIdsFromProtocolUid: ", res);

        if (res.length > 0) {

          console.log("Can't update protocol.  Pipelines need to be deleted first");
          this._snackBar.open("Pipelines are associated with this protocol.  Can't be updated", "Cancel", {
            duration: 5000,
          });
          this.resetProtocolForm();
        }
        else {
          let protocolType = this.protocolForm.get('protocolType').value;

          let scope = this.protocolForm.get('scope').value;
          if (scope != "GLOBAL") {
            scope = this.gatewayId;
          }
          protocol.scope = scope;

          if (protocolType == "MQTT") {
            protocol.authMode = "";
            protocol.brokerURL = "tcp://" + this.protocolForm.get('mqtt.hostname').value + ":" + this.protocolForm.get('mqtt.port').value;
            protocol.caCerticate = this.protocolForm.get('mqtt.caCertificate').value;
            protocol.clientCertificate = this.protocolForm.get('mqtt.clientCertificate').value;
            protocol.clientKey = this.protocolForm.get('mqtt.clientKey').value;
            protocol.commitInterval = "";
            protocol.connectionTimeout = "";
            protocol.consumerGroupId = "";
            protocol.created = ts;
            protocol.encryptionMode = this.protocolForm.get('mqtt.encryptionMode').value;
            protocol.fetchMaxWait = "";
            protocol.fetchMinBytes = "";
            protocol.heartbeatInterval = "";
            protocol.initialOffset = "";
            protocol.maximumQOS = this.protocolForm.get('mqtt.maximumQOS').value;
            protocol.modified = ts;
            protocol.password = this.protocolForm.get('mqtt.password').value;
            protocol.protocolType = protocolType;
            protocol.retryBackoff = "";
            protocol.serverCertificate = "";
            protocol.sessionTimeout = "";
            protocol.topic = this.protocolForm.get('mqtt.topic').value;
            protocol.username = this.protocolForm.get('mqtt.username').value;
            protocol.uuid = this.protocolForm.get('mqtt.uuid').value;
          }
          else if (protocolType == "Kafka") {
            protocol.authMode = this.protocolForm.get('kafka.authMode').value;
            protocol.brokerURL = this.protocolForm.get('kafka.hostname').value + ":" + this.protocolForm.get('kafka.port').value;
            protocol.caCerticate = "";
            protocol.clientCertificate = this.protocolForm.get('kafka.clientCertificate').value;
            protocol.clientKey = this.protocolForm.get('kafka.clientKey').value;
            protocol.commitInterval = this.protocolForm.get('kafka.commitInterval').value;
            protocol.connectionTimeout = this.protocolForm.get('kafka.connectionTimeout').value;
            protocol.consumerGroupId = this.protocolForm.get('kafka.consumerGroupId').value;
            protocol.created = this.protocolForm.get('kafka.created').value;;
            protocol.encryptionMode = "";
            protocol.fetchMaxWait = this.protocolForm.get('kafka.fetchMaxWait').value;
            protocol.fetchMinBytes = this.protocolForm.get('kafka.fetchMinBytes').value;
            protocol.heartbeatInterval = this.protocolForm.get('kafka.heartbeatInterval').value;
            protocol.initialOffset = this.protocolForm.get('kafka.initialOffset').value;
            protocol.maximumQOS = "";
            protocol.modified = ts;
            protocol.password = this.protocolForm.get('kafka.password').value;
            protocol.protocolType = protocolType;
            protocol.retryBackoff = this.protocolForm.get('kafka.retryBackoff').value;
            protocol.serverCertificate = this.protocolForm.get('kafka.serverCertificate').value;
            protocol.sessionTimeout = this.protocolForm.get('kafka.sessionTimeout').value;
            protocol.topic = this.protocolForm.get('kafka.topic').value;
            protocol.username = this.protocolForm.get('kafka.username').value;
            protocol.uuid = this.protocolForm.get('mqtt.uuid').value;
          }
          else if (protocolType == "AMQP") {
            protocol.brokerURL = this.protocolForm.get('amqp.hostname').value + ":" + this.protocolForm.get('amqp.port').value;
            protocol.username = this.protocolForm.get('amqp.username').value;
            protocol.password = this.protocolForm.get('amqp.password').value;
            protocol.created = ts;
            protocol.modified = ts;
            protocol.protocolType = protocolType;
            protocol.topic = this.protocolForm.get('amqp.exchangeName').value;
            protocol.uuid = this.protocolForm.get('amqp.uuid').value;
          }

          this.graphService.updateProtocol(protocol)
            .subscribe(res => {
              console.log("Result from update protocol", res);

              this.getProtocols(this.gatewayId);
              this.resetProtocolForm();
            });
        }

      });

  }

  /**
   * Deletes the protocol from the graph data store
   */
  deleteProtocol() {
    let protocolUid = this.protocolForm.get('uid').value;
    console.log("deleting protocol: ", protocolUid);

    // First Check if there are pipelines associated with the protocol
    this.graphService.getPipelineIdsFromProtocolUid(protocolUid)
      .subscribe(res => {
        console.log("Received response for graphService.getPipelineIdsFromProtocolUid: ", res);

        if (res.length > 0) {

          console.log("Can't delete protocol.  Pipelines need to be deleted first");
          this._snackBar.open("Pipelines are associated with this protocol.  Can't be deleted", "Cancel", {
            duration: 5000,
          });
          this.resetProtocolForm();
        }
        else {
          this.graphService.deleteProtocol(0, this.protocolForm.get('uid').value)
            .subscribe(res => {
              console.log("Result from delete protocol ", res);

              this.getProtocols(this.gatewayId);
              this.resetProtocolForm();

            });
        }

      });

  }

  /**
   * Fucntion called when the form changes
   */
  onFormChanges(): void {
    this.protocolForm.valueChanges.subscribe(val => {

      if (this.protocolForm.dirty) {

        this.graphDeleteOpDisabled = true;
        this.graphAddOpDisabled = false;

        if (this.protocolSelection.hasValue()) {
          this.graphUpdateOpDisabled = false;
        }
        else {
          this.graphUpdateOpDisabled = true;
        }
      }

    });
  }

  /**
   * Function called when the  protocol selector is changed on the protocol form
   * @param event - the selector event
   */
  onProtocolTypeSelected(event) {
    console.log("Option selected: ", event);

    this.mqttProtocol = false;
    this.kafkaProtocol = false;
    this.amqpProtocol = false;
    this.httpProtocol = false;

    if (event.value == "MQTT") {

      // Update transport Form
      this.protocolForm.patchValue(
        {
          mqtt: {
            uuid: '',
            hostname: '',
            port: '',
            username: '',
            password: '',
            encryptionMode: 'None',
            caCerticate: '',
            clientCertificate: '',
            clientKey: '',
            topic: '',
            maximumQOS: '2'
          },
          kafka: {
            uuid: '',
            hostname: 'changeme',
            port: 'changeme',
            authMode: 'changeme',
            username: 'changeme',
            password: 'changeme',
            clientCertificate: 'changeme',
            clientKey: 'changeme',
            serverCertificate: 'changeme',
            connectionTimeout: 'changeme',
            retryBackoff: 'changeme',
            topic: 'changeme',
            consumerGroupId: 'changeme',
            commitInterval: 'changeme',
            initialOffset: 'changeme',
            fetchMinBytes: 'changeme',
            fetchMaxWait: 'changeme',
            heartbeatInterval: 'changeme',
            sessionTimeout: 'changeme'
          },
          amqp: {
            uuid: '',
            hostname: 'changeme',
            port: 'changeme',
            username: 'changeme',
            password: 'changeme',
            exchangeName: '',
            exchangeType: 'topic',
            routingKey: 'air',
            reliable: 'true'
          }
        },
        { emitEvent: false }
      );

      this.mqttProtocol = true;
    }
    else if (event.value == "Kafka") {

      // Update transport Form
      this.protocolForm.patchValue(
        {
          mqtt: {
            uuid: 'changeme',
            hostname: 'changeme',
            port: 'changeme',
            username: 'changeme',
            password: 'changeme',
            encryptionMode: 'None',
            caCerticate: 'changeme',
            clientCertificate: 'changeme',
            clientKey: 'changeme',
            topic: 'changeme',
            maximumQOS: '2'
          },
          kafka: {
            uuid: '',
            hostname: '',
            port: '',
            authMode: 'None',
            username: '',
            password: '',
            clientCertificate: '',
            clientKey: '',
            serverCertificate: '',
            connectionTimeout: '30',
            retryBackoff: '3',
            topic: '',
            consumerGroupId: '',
            commitInterval: '500',
            initialOffset: 'Oldest',
            fetchMinBytes: '1',
            fetchMaxWait: '500',
            heartbeatInterval: '3000',
            sessionTimeout: '30000'
          },
          amqp: {
            uuid: '',
            hostname: 'changeme',
            port: 'changeme',
            username: 'changeme',
            password: 'changeme',
            exchangeName: '',
            exchangeType: 'topic',
            routingKey: 'air',
            reliable: 'true'
          }
        },
        { emitEvent: false }
      );

      this.kafkaProtocol = true;
    }
    else if (event.value == "AMQP") {

      // Update transport Form
      this.protocolForm.patchValue(
        {
          mqtt: {
            uuid: 'changeme',
            hostname: 'changeme',
            port: 'changeme',
            username: 'changeme',
            password: 'changeme',
            encryptionMode: 'None',
            caCerticate: 'changeme',
            clientCertificate: 'changeme',
            clientKey: 'changeme',
            topic: 'changeme',
            maximumQOS: '2'
          },
          kafka: {
            uuid: '',
            hostname: '',
            port: '',
            authMode: 'None',
            username: '',
            password: '',
            clientCertificate: '',
            clientKey: '',
            serverCertificate: '',
            connectionTimeout: '30',
            retryBackoff: '3',
            topic: '',
            consumerGroupId: '',
            commitInterval: '500',
            initialOffset: 'Oldest',
            fetchMinBytes: '1',
            fetchMaxWait: '500',
            heartbeatInterval: '3000',
            sessionTimeout: '30000'
          },
          amqp: {
            uuid: '',
            hostname: '',
            port: '',
            username: '',
            password: '',
            exchangeName: '',
            exchangeType: 'topic',
            routingKey: 'air',
            reliable: 'true'
          }
        },
        { emitEvent: false }
      );

      this.amqpProtocol = true;
    }
    else if (event.value == "HTTP") {
      this.httpProtocol = true;
    }

  }

  protocolExist(uuid: string): boolean {
    let found = false;

    this.protocolsDataSource.data.forEach(
      protocol => {

        if (protocol.uuid == uuid) {
          found = true;
        }
      }
    );

    return found;
  }

}
