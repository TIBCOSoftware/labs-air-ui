import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { GraphService } from '../../../services/graph/graph.service';
import { Protocol } from '../../../shared/models/iot.model';
export interface SelectItem {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-protocols',
  templateUrl: './protocols.component.html',
  styleUrls: ['./protocols.component.css']
})
export class ProtocolsComponent implements OnInit {

  hidePassword = true;

  mqttProtocol = false;
  kafkaProtocol = false;
  httpProtocol = false;

  protocols: Protocol[];

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

  @Input() transportForm: FormGroup;

  constructor(private graphService: GraphService) {

  }

  ngOnInit() {
    console.log("On Protocols ngOnInit. Getting publisher for: ", this.transportForm.get('gateway').value);
    this.getProtocols(this.transportForm.get('gateway').value);

    this.onFormChanges();
  }

  public getProtocols(gatewayId: string) {
    console.log("Getting protocols for: ", gatewayId);

    this.graphService.getProtocols(gatewayId)
      .subscribe(res => {
        console.log("Received response for graphService.getProtocols: ", res);
        this.protocols = res as Protocol[];

      })
  }

  onProtocolSelected(event) {
    console.log("Option selected: ", event);

    let protocol = this.protocols[event.value];

    console.log("Selected protocol: ", protocol.protocolType);

    this.mqttProtocol = false;
    this.kafkaProtocol = false;
    this.httpProtocol = false;

    if (protocol.protocolType == "MQTT") {
      let delimInd = protocol.brokerURL.lastIndexOf(":");
      let hostname = protocol.brokerURL.substring(6, delimInd);
      let port = protocol.brokerURL.substring(delimInd + 1);

      // Update transport Form
      this.transportForm.patchValue(
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
      this.transportForm.patchValue(
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
          }
        },
        { emitEvent: false }
      );

      this.kafkaProtocol = true;
    }
    else if (protocol.protocolType == "HTTP") {
      this.httpProtocol = true;
    }

  }

  onKafkaAuthModeSelected(event) {
  }

  onMQTTEncryptionModeSelected(event) {
  }

  stepSubmitted() {
    // this.transportForm.get('transport').markAsTouched();
    // this.transportForm.get('transport').updateValueAndValidity();
    // this.transportForm.get('personalDetails').get('lastname').markAsTouched();
    // this.transportForm.get('personalDetails').get('lastname').updateValueAndValidity();
  }

  onFormChanges(): void {
    this.transportForm.valueChanges.subscribe(val => {
      // console.log("TransportForm has changed for: ", val);

      if (this.transportForm.get('protocol').value == "") {
        
        this.mqttProtocol = false;
        this.kafkaProtocol = false;
        this.httpProtocol = false;
      }

    });
  }

}
