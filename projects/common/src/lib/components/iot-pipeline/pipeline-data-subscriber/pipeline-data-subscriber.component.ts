import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Protocol } from '@TIBCOSoftware/labs-air-graph-client';
import { GraphService } from '@TIBCOSoftware/labs-air-graph-client';
import { debounceTime, Subscription, distinctUntilChanged, Observable } from 'rxjs';

export interface SelectItem {
    value: string;
    viewValue: string;
}

@Component({
    selector: 'app-common-pipeline-data-subscriber',
    templateUrl: './pipeline-data-subscriber.component.html',
    styleUrls: ['./pipeline-data-subscriber.component.css']
})
export class PipelineDataSubscriberComponent implements OnInit, OnDestroy {

    @Input() gatewayId;
    @Input() dataSubscriber;
    @Output() formUpdatedEvent = new EventEmitter<Protocol>();
    dataSubscriberForm: FormGroup;
    formChangeSubscription: Subscription;
    @Input() nodeChangeEvent: Observable<any>;
    nodeChangeSubscription: Subscription;

    logLevels: SelectItem[] = [
        { value: 'INFO', viewValue: 'INFO' },
        { value: 'WARN', viewValue: 'WARN' },
        { value: 'ERROR', viewValue: 'ERROR' },
        { value: 'DEBUG', viewValue: 'DEBUG' }
    ];

    hidePassword = true;

    mqttProtocol = false;
    kafkaProtocol = false;
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

    constructor(private graphService: GraphService, private formBuilder: FormBuilder) {

    }

    ngOnInit() {
        this.initForm();
        this.getProtocols(this.dataSubscriberForm.get('gateway').value);

        this.onFormChanges();
        if (this.dataSubscriber) {
            this.updateDataSubscriberForm(this.dataSubscriber.data['customdata'])
        }
    }

    ngOnDestroy(): void {
        this.formChangeSubscription.unsubscribe();
        this.nodeChangeSubscription.unsubscribe();
    }

    public getProtocols(gatewayId: string) {

        this.graphService.getProtocols(gatewayId)
            .subscribe(res => {
                this.protocols = res as Protocol[];

                const currentProtocol = this.dataSubscriberForm.get('protocolId').value;
                if (currentProtocol == '') {
                    this.mqttProtocol = false;
                    this.kafkaProtocol = false;
                    this.httpProtocol = false;
                }
                else {
                    const protocol = this.getProtocolById(currentProtocol);
                    this.setForm(protocol);
                }

            });
    }

    onProtocolSelected(event) {

        // let protocol = this.protocols[event.value];
        const protocol = this.getProtocolById(event.value);

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

        console.log('Selected protocol: ', protocol.protocolType);

        this.mqttProtocol = false;
        this.kafkaProtocol = false;
        this.httpProtocol = false;

        if (protocol.protocolType == 'MQTT') {
            const delimInd = protocol.brokerURL.lastIndexOf(':');
            const hostname = protocol.brokerURL.substring(6, delimInd);
            const port = protocol.brokerURL.substring(delimInd + 1);

            // Update transport Form
            this.dataSubscriberForm.patchValue(
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
        else if (protocol.protocolType == 'Kafka') {
            const delimInd = protocol.brokerURL.lastIndexOf(':');
            const hostname = protocol.brokerURL.substring(0, delimInd);
            const port = protocol.brokerURL.substring(delimInd + 1);

            // Update transport Form
            this.dataSubscriberForm.patchValue(
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
        else if (protocol.protocolType == 'HTTP') {
            this.httpProtocol = true;
        }

    }

    onFormChanges(): void {
        this.nodeChangeSubscription = this.nodeChangeEvent.subscribe( node => {
            this.updateDataSubscriberForm(node.data['customdata']);
        });
        this.formChangeSubscription = this.dataSubscriberForm.valueChanges
        .pipe(
            debounceTime(200),
            distinctUntilChanged()
        )
        .subscribe(val => {
            console.log('dataSubscriberForm has changed for: ', val);

            if (this.dataSubscriberForm.get('protocol').value == 'MQTT') {
                this.mqttProtocol = true;
            }
            else if (this.dataSubscriberForm.get('protocol').value == 'Kafka') {
                this.kafkaProtocol = true;
            }
            else {

                this.mqttProtocol = false;
                this.kafkaProtocol = false;
                this.httpProtocol = false;
            }
            this.formUpdatedEvent.emit(this.dataSubscriberForm.value);
        });
    }

    initForm() {
        this.dataSubscriberForm = this.formBuilder.group({
            uid: ['changeme', Validators.required],
            gateway: [this.gatewayId, Validators.required],
            protocolId: ['', Validators.required],
            protocol: ['', Validators.required],
            logLevel: ['INFO', Validators.required],
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
            kafka: this.formBuilder.group({
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
                hostname: ['changeme', Validators.required],
                port: ['changeme', Validators.required],
                username: ['changeme', Validators.required],
                password: ['changeme', Validators.required],
                exchangeName: ['changeme', Validators.required],
                exchangeType: ['topic', Validators.required],
                routingKey: ['air', Validators.required],
                reliable: ['true', Validators.required],
            })
        });

    }

    /**
     *
     * @param context
     */
     updateDataSubscriberForm(context) {

        if (context != null || context != undefined) {
            console.log('Updating protocolform with context: ', context);

            const protocolId = context.protocolId;
            const protocol = context.protocol;

            // Update protocol form
            console.log('Setting transportviewform protocol to: ', protocol);

            if (protocol == 'MQTT') {

                this.dataSubscriberForm.patchValue({
                    protocol: protocol,
                    protocolId: protocolId,
                    logLevel: context.logLevel,
                    mqtt: {
                        hostname: context.hostname,
                        port: context.port,
                        username: context.username,
                        password: context.password,
                        encryptionMode: context.encryptionMode,
                        caCertificate: context.caCertificate,
                        clientCertificate: context.clientCertificate,
                        clientKey: context.clientKey,
                        topic: context.topic,
                        maximumQOS: context.maximumQOS
                    }
                });

            }
            else if (protocol == 'Kafka') {

                this.dataSubscriberForm.patchValue({
                    protocol: protocol,
                    protocolId: protocolId,
                    logLevel: context.logLevel,
                    kafka: {
                        hostname: context.hostname,
                        port: context.port,
                        authMode: context.authMode,
                        username: context.username,
                        password: context.password,
                        clientCertificate: context.clientCertificate,
                        clientKey: context.clientKey,
                        serverCertificate: context.serverCertificate,
                        connectionTimeout: context.connectionTimeout,
                        retryBackoff: context.retryBackoff,
                        topic: context.topic,
                        consumerGroupId: context.consumerGroupId,
                        commitInterval: context.commitInterval,
                        initialOffset: context.initialOffset,
                        fetchMinBytes: context.fetchMinBytes,
                        fetchMaxWait: context.fetchMaxWait,
                        heartbeatInterval: context.heartbeatInterval,
                        sessionTimeout: context.sessionTimeout
                    }
                });
            }
            else if (protocol == 'AMQP') {

                this.dataSubscriberForm.patchValue({
                    protocol: protocol,
                    protocolId: protocolId,
                    logLevel: context.logLevel,
                    amqp: {
                        hostname: context.hostname,
                        port: context.port,
                        username: context.username,
                        password: context.password,
                        exchangeName: context.exchangeName,
                        exchangeType: context.exchangeType,
                        routingKey: context.routingKey,
                        reliable: context.reliable
                    }
                });
            }

        }
    }
}

