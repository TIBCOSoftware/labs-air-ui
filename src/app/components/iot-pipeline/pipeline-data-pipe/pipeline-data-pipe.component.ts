import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { GraphService } from '../../../services/graph/graph.service';
import { Protocol } from '../../../shared/models/iot.model';

@Component({
  selector: 'app-pipeline-data-pipe',
  templateUrl: './pipeline-data-pipe.component.html',
  styleUrls: ['./pipeline-data-pipe.component.css']
})
export class PipelineDataPipeComponent implements OnInit {

  @Input() dataPipeForm: FormGroup;

  hidePassword = true;

  mqttProtocol = false;
  kafkaProtocol = false;
  amqpProtocol = false;
  httpProtocol = false;

  protocols: Protocol[];

  constructor(private graphService: GraphService) {

  }

  ngOnInit() {
    this.getProtocols(this.dataPipeForm.get('gateway').value);

    this.onFormChanges();
  }

  public getProtocols(gatewayId: string) {

    this.graphService.getProtocols(gatewayId)
      .subscribe(res => {
        this.protocols = res as Protocol[];

        let currentProtocol = this.dataPipeForm.get('protocolId').value;

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
      this.dataPipeForm.patchValue(
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
      this.dataPipeForm.patchValue(
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
      this.dataPipeForm.patchValue(
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
    this.dataPipeForm.valueChanges.subscribe(val => {
      console.log("dataPipeForm has changed for: ", val);

      if (this.dataPipeForm.get('protocol').value == "") {

        this.mqttProtocol = false;
        this.kafkaProtocol = false;
        this.amqpProtocol = false;
        this.httpProtocol = false;
      }

    });
  }



}
