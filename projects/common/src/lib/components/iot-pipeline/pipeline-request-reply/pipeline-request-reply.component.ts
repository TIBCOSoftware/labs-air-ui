import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GraphService, Protocol } from '@TIBCOSoftware/labs-air-graph-client';
import { debounceTime, distinctUntilChanged, Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-pipeline-request-reply',
  templateUrl: './pipeline-request-reply.component.html',
  styleUrls: ['./pipeline-request-reply.component.css']
})
export class PipelineRequestReplyComponent implements OnInit, OnDestroy {

  @Input() gatewayId: string;
  @Input() requestReply;
  @Output() formUpdatedEvent = new EventEmitter<any>();
  @Input() nodeChangeEvent: Observable<any>;
  nodeChangeSubscription: Subscription;
  requestReplyForm: FormGroup;
  formChangeSubscription: Subscription;

  constructor(private graphService: GraphService, private formBuilder: FormBuilder) { }

  logLevels = [
    { value: 'INFO', viewValue: 'INFO' },
    { value: 'WARN', viewValue: 'WARN' },
    { value: 'ERROR', viewValue: 'ERROR' },
    { value: 'DEBUG', viewValue: 'DEBUG' }
  ];

  hidePassword = true;

  protocols: Protocol[] = [];
  showFields = false;

  ngOnInit(): void {
    this.getProtocols(this.gatewayId);
    this.initForm();
    this.onFormChanges();
    if (this.requestReply) {
      this.updateMQTTRequestReplyForm(this.requestReply.data['customdata'])
    }
  }

  ngOnDestroy(): void {
    this.formChangeSubscription.unsubscribe();
    this.nodeChangeSubscription.unsubscribe();
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
    return protocol
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

  onFormChanges() {
    this.nodeChangeSubscription = this.nodeChangeEvent.subscribe(node => {
      this.updateMQTTRequestReplyForm(node.data['customdata']);
    });
    this.formChangeSubscription = this.requestReplyForm.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged())
      .subscribe(() => {
        this.formUpdatedEvent.emit(this.requestReplyForm.value)
      })
  }

  initForm() {
    this.requestReplyForm = this.formBuilder.group({
      uid: ['', Validators.required],
      gateway: [this.gatewayId, Validators.required],
      protocolId: ['', Validators.required],
      protocol: ['', Validators.required],
      logLevel: ['INFO', Validators.required],
      timeout: ['', Validators.required],
      dataTemplate: ['', Validators.required],
      producer: ['', Validators.required],
      mqtt: this.formBuilder.group({
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
    });
  }

  updateMQTTRequestReplyForm(context: any) {
    if (context != null || context != undefined) {
      this.requestReplyForm.patchValue({
        uid: context.uid,
        protocol: context.protocol,
        protocolId: context.protocolId,
        logLevel: context.logLevel,
        timeout: context.timeout,
        gateway: context.gateway,
        dataTemplate: context.dataTemplate,
        producer: context.producer,
        mqtt: {
          hostname: context.mqtt.hostname,
          port: context.mqtt.hostname,
          username: context.mqtt.username,
          password: context.mqtt.password,
          encryptionMode: context.mqtt.encryptionMode,
          caCertificate: context.mqtt.caCertificate,
          clientCertificate: context.mqtt.clientCertificate,
          clientKey: context.mqtt.clientKey,
          topic: context.mqtt.topic,
          maximumQOS: context.mqtt.maximumQOS,
        }
      })
    }
  }
}
