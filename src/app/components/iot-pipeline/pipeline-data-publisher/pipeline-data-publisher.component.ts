import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { GraphService } from '../../../services/graph/graph.service';
import { Protocol } from '../../../shared/models/iot.model';
export interface SelectItem {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-pipeline-data-publisher',
  templateUrl: './pipeline-data-publisher.component.html',
  styleUrls: ['./pipeline-data-publisher.component.css']
})
export class PipelineDataPublisherComponent implements OnInit {

  @Input() dataPublisherForm: FormGroup;

  logLevels: SelectItem[] = [
    { value: 'INFO', viewValue: 'INFO' },
    { value: 'WARN', viewValue: 'WARN' },
    { value: 'ERROR', viewValue: 'ERROR' },
    { value: 'DEBUG', viewValue: 'DEBUG' }
  ];

  hidePassword = true;

  mqttProtocol = false;
  kafkaProtocol = false;
  amqpProtocol = false;
  httpProtocol = false;

  protocols: Protocol[];
  kafkaInitialOffsets: SelectItem[] = [
    { value: 'Oldest', viewValue: 'Oldest' },
    { value: 'Newest', viewValue: 'Newest' }
  ];
  kafkaAuthModes: SelectItem[] = [
    { value: 'None', viewValue: 'None' },
    { value: 'SASL/Plain', viewValue: 'SASL/Plain' },
    { value: 'SSL', viewValue: 'SSL' }
  ];
  onKafkaAuthModeSelected(event) {
  }

  constructor(private graphService: GraphService) {

  }

  ngOnInit() {
    this.getProtocols(this.dataPublisherForm.get('gateway').value);

    this.onFormChanges();
  }

  public getProtocols(gatewayId: string) {

    this.graphService.getProtocols(gatewayId)
      .subscribe(res => {
        this.protocols = res as Protocol[];

        let currentProtocol = this.dataPublisherForm.get('protocolId').value;

        if (currentProtocol == '') {
          this.mqttProtocol = false;
          this.kafkaProtocol = false;
          this.amqpProtocol = false;
          this.httpProtocol = false;
        }
        else {

          let protocol = this.getProtocolById(currentProtocol);

          this.setForm(protocol);

        }

      })
  }

  onProtocolSelected(event) {

    // let protocol = this.protocols[event.value];
    let protocol = this.getProtocolById(event.value);

    this.setForm(protocol);
  }

  getProtocolById(id) {
    let protocol = null;

    for (let i = 0; i < this.protocols.length; i++) {
      if (this.protocols[i].uuid == id) {
        protocol = this.protocols[i];
        break;
      }
    }

    return protocol;

  }

  setForm(protocol) {

    console.log("setForm protocol: ", protocol);
    console.log("Selected protocol: ", protocol.protocolType);

    this.mqttProtocol = false;
    this.kafkaProtocol = false;
    this.amqpProtocol = false;
    this.httpProtocol = false;

    if (protocol.protocolType == "MQTT") {
      let delimInd = protocol.brokerURL.lastIndexOf(":");
      let hostname = protocol.brokerURL.substring(6, delimInd);
      let port = protocol.brokerURL.substring(delimInd + 1);

      // Update transport Form
      this.dataPublisherForm.patchValue(
        {
          uid: protocol.uid,
          protocol: protocol.protocolType,
          mqtt: {
            hostname: hostname,
            port: port,
            username: protocol.username,
            password: protocol.password,
            encryptionMode: protocol.encryptionMode,
            caCertificate: protocol.caCerticate,
            clientCertificate: protocol.clientCertificate,
            clientKey: protocol.clientKey,
            topic: protocol.topic,
            maximumQOS: protocol.maximumQOS
          },
          kafka: {
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
            hostname: 'changeme',
            port: 'changeme',
            username: 'changeme',
            password: 'changeme',
            exchangeName: 'changeme',
            exchangeType: 'changeme',
            routingKey: 'changeme',
            reliable: 'changeme'
          }
        },
        { emitEvent: false }
      );

      this.mqttProtocol = true;
    }
    else if (protocol.protocolType == "Kafka") {
      let delimInd = protocol.brokerURL.lastIndexOf(":");
      let hostname = protocol.brokerURL.substring(0, delimInd);
      let port = protocol.brokerURL.substring(delimInd + 1);

      // Update transport Form
      this.dataPublisherForm.patchValue(
        {
          uid: protocol.uid,
          protocol: protocol.protocolType,
          mqtt: {
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
            hostname: hostname,
            port: port,
            authMode: protocol.authMode,
            username: protocol.username,
            password: protocol.password,
            clientCertificate: protocol.clientCertificate,
            clientKey: protocol.clientKey,
            serverCertificate: protocol.serverCertificate,
            connectionTimeout: protocol.connectionTimeout,
            retryBackoff: protocol.retryBackoff,
            topic: protocol.topic,
            consumerGroupId: protocol.consumerGroupId,
            commitInterval: protocol.commitInterval,
            initialOffset: protocol.initialOffset,
            fetchMinBytes: protocol.fetchMinBytes,
            fetchMaxWait: protocol.fetchMaxWait,
            heartbeatInterval: protocol.heartbeatInterval,
            sessionTimeout: protocol.sessionTimeout,
          },
          amqp: {
            hostname: 'changeme',
            port: 'changeme',
            username: 'changeme',
            password: 'changeme',
            exchangeName: 'changeme',
            exchangeType: 'changeme',
            routingKey: 'changeme',
            reliable: 'changeme'
          }
        },
        { emitEvent: false }
      );

      this.kafkaProtocol = true;
    }
    else if (protocol.protocolType == "AMQP") {
      let delimInd = protocol.brokerURL.lastIndexOf(":");
      let hostname = protocol.brokerURL.substring(0, delimInd);
      let port = protocol.brokerURL.substring(delimInd + 1);

      // Update transport Form
      this.dataPublisherForm.patchValue(
        {
          uid: protocol.uid,
          protocol: protocol.protocolType,
          mqtt: {
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
            hostname: hostname,
            port: port,
            username: protocol.username,
            password: protocol.password,
            exchangeName: protocol.topic,
            exchangeType: 'topic',
            routingKey: 'air',
            reliable: 'true'
          }
        },
        { emitEvent: false }
      );

      this.amqpProtocol = true;
    }
    else if (protocol.protocolType == "HTTP") {
      this.httpProtocol = true;
    }

  }

  onFormChanges(): void {
    this.dataPublisherForm.valueChanges.subscribe(val => {

      console.log("OnFormChanges: ", val);

      let protocol = this.dataPublisherForm.get('protocol').value;

      this.mqttProtocol = false;
      this.kafkaProtocol = false;
      this.amqpProtocol = false;
      this.httpProtocol = false;

      if (protocol != "") {

        if (protocol == "MQTT") {
          this.mqttProtocol = true;
        }
        else if (protocol == "Kafka") { 
          this.kafkaProtocol = true;
        }
        else if (protocol == "AMQP") {
          this.amqpProtocol = true;
        }
        else if (protocol == "HTTP") {
          this.httpProtocol = true;
        }
        
      }

    });
  }
}
