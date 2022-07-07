import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { GraphService, Protocol } from '@TIBCOSoftware/labs-air-graph-client';

@Component({
  selector: 'app-pipeline-request-reply',
  templateUrl: './pipeline-request-reply.component.html',
  styleUrls: ['./pipeline-request-reply.component.css']
})
export class PipelineRequestReplyComponent implements OnInit {

  @Input() requestReplyForm: UntypedFormGroup;

  constructor(private graphService: GraphService) { }

  logLevels = [
    { value: 'INFO', viewValue: 'INFO' },
    { value: 'WARN', viewValue: 'WARN' },
    { value: 'ERROR', viewValue: 'ERROR' },
    { value: 'DEBUG', viewValue: 'DEBUG' }
  ];

  hidePassword = true;

  protocols = [];
  showFields = false;

  ngOnInit(): void {
    this.getProtocols(this.requestReplyForm.get('gateway').value);
  }

  getProtocols(gatewayId: string) {
    this.graphService.getProtocols(gatewayId)
      .subscribe(res => {
        this.protocols = res.filter(x => x.protocolType === 'MQTT') as Protocol[];
        const currentProtocol = this.requestReplyForm.get('protocolId').value;
        if (currentProtocol == '') {
          this.showFields = false;
        }
        else {
          const protocol = this.getProtocolById(currentProtocol);
          this.setForm(protocol);
        }
      });
  }

  onProtocolSelected(event) {
    const protocol = this.getProtocolById(event.value);
    this.setForm(protocol);
  }

  getProtocolById(id) {
    let protocol = null;

    for (let i = 0; i < this.protocols.length; i++) {
      if (this.protocols[i].uuid == id) {
        protocol = this.protocols[i];
      }
    }
    return protocol;
  }

  setForm(protocol) {
    if (protocol) {
      const delimInd = protocol.brokerURL.lastIndexOf(':');
      const hostname = protocol.brokerURL.substring(6, delimInd);
      const port = protocol.brokerURL.substring(delimInd + 1);
  
      // Update transport Form
      this.requestReplyForm.patchValue(
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
          }
        },
        { emitEvent: false }
      );
  
      this.showFields = true;
    }
  }

}
