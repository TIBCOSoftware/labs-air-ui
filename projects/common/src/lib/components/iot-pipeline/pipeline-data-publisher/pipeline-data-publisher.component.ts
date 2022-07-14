import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Validators, UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { GraphService } from '@TIBCOSoftware/labs-air-graph-client';
import { Protocol } from '@TIBCOSoftware/labs-air-graph-client';
import { debounceTime, Subscription, distinctUntilChanged, Observable } from 'rxjs';

export interface SelectItem {
    value: string;
    viewValue: string;
}

@Component({
    selector: 'app-common-pipeline-data-publisher',
    templateUrl: './pipeline-data-publisher.component.html',
    styleUrls: ['./pipeline-data-publisher.component.css']
})
export class PipelineDataPublisherComponent implements OnInit, OnDestroy {

    @Input() gatewayId: string;
    @Input() protocol: any;
    @Input() nodeChangeEvent: Observable<any>;
    nodeChangeSubscription: Subscription;
    @Output() formUpdatedEvent = new EventEmitter<Protocol>();
    dataPublisherForm: UntypedFormGroup;
    dataOptionsForm: UntypedFormGroup;

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

    formChangeSubscription: Subscription;

    onKafkaAuthModeSelected(event) {
    }

    constructor(private graphService: GraphService, private formBuilder: UntypedFormBuilder) {

    }

    ngOnInit() {
        this.getProtocols(this.gatewayId);
        this.initForms();
        this.onFormChanges();
        if (this.protocol?.data['customdata']) {
            this.updateProtocolForm(this.protocol.data['customdata'])
        }
    }

    ngOnDestroy(): void {
        this.formChangeSubscription.unsubscribe();
        this.nodeChangeSubscription.unsubscribe();
    }

    getProtocols(gatewayId: string) {

        this.graphService.getProtocols(gatewayId)
            .subscribe(res => {
                this.protocols = res as Protocol[];

                const currentProtocol = this.dataPublisherForm.get('protocolId').value;

                if (currentProtocol == '') {
                    this.mqttProtocol = false;
                    this.kafkaProtocol = false;
                    this.amqpProtocol = false;
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

        console.log('setForm protocol: ', protocol);
        console.log('Selected protocol: ', protocol.protocolType);

        this.mqttProtocol = false;
        this.kafkaProtocol = false;
        this.amqpProtocol = false;
        this.httpProtocol = false;
        this.resetProtocolType();
        let delimInd = protocol.brokerURL.lastIndexOf(':');
        if (protocol.protocolType == 'MQTT') {
            this.dataPublisherForm.patchValue(
                {
                    uid: protocol.uid,
                    protocol: protocol.protocolType,
                    mqtt: {
                        hostname: protocol.mqtt.brokerURL.substring(6, delimInd),
                        port: protocol.mqtt.brokerURL.substring(delimInd + 1),
                        username: protocol.mqtt.username,
                        password: protocol.mqtt.password,
                        encryptionMode: protocol.mqtt.encryptionMode,
                        caCertificate: protocol.mqtt.caCerticate,
                        clientCertificate: protocol.mqtt.clientCertificate,
                        clientKey: protocol.mqtt.clientKey,
                        topic: protocol.mqtt.topic,
                        maximumQOS: protocol.mqtt.maximumQOS
                    }
                },
                { emitEvent: false }
            );

            this.mqttProtocol = true;
        }
        else if (protocol.protocolType == 'Kafka') {
            this.dataPublisherForm.patchValue(
                {
                    uid: protocol.uid,
                    protocol: protocol.protocolType,
                    kafka: {
                        hostname: protocol.kafka.brokerURL.substring(0, delimInd),
                        port: protocol.kafka.brokerURL.substring(delimInd + 1),
                        authMode: protocol.kafka.authMode,
                        username: protocol.kafka.username,
                        password: protocol.kafka.password,
                        clientCertificate: protocol.kafka.clientCertificate,
                        clientKey: protocol.kafka.clientKey,
                        serverCertificate: protocol.kafka.serverCertificate,
                        connectionTimeout: protocol.kafka.connectionTimeout,
                        retryBackoff: protocol.kafka.retryBackoff,
                        topic: protocol.kafka.topic,
                        consumerGroupId: protocol.kafka.consumerGroupId,
                        commitInterval: protocol.kafka.commitInterval,
                        initialOffset: protocol.kafka.initialOffset,
                        fetchMinBytes: protocol.kafka.fetchMinBytes,
                        fetchMaxWait: protocol.kafka.fetchMaxWait,
                        heartbeatInterval: protocol.kafka.heartbeatInterval,
                        sessionTimeout: protocol.kafka.sessionTimeout,
                    }
                },
                { emitEvent: false }
            );

            this.kafkaProtocol = true;
        }
        else if (protocol.protocolType == 'AMQP') {
            this.dataPublisherForm.patchValue(
                {
                    uid: protocol.uid,
                    protocol: protocol.protocolType,
                    amqp: {
                        hostname: protocol.amqp.brokerURL.substring(0, delimInd),
                        port: protocol.amqp.brokerURL.substring(delimInd + 1),
                        username: protocol.amqp.username,
                        password: protocol.amqp.password,
                        exchangeName: protocol.amqp.topic,
                        exchangeType: 'topic',
                        routingKey: 'air',
                        reliable: 'true'
                    }
                },
                { emitEvent: false }
            );
            this.amqpProtocol = true;
        }
        else if (protocol.protocolType == 'HTTP') {
            this.httpProtocol = true;
        }

    }

    onFormChanges(): void {
        this.nodeChangeSubscription = this.nodeChangeEvent.subscribe( node => {
            this.updateProtocolForm(node.data['customdata']);
            console.log('DID THIS FIRE?')
        });

        this.formChangeSubscription = this.dataPublisherForm.valueChanges
        .pipe(
            debounceTime(200),
            distinctUntilChanged()
        )
        .subscribe(val => {

            console.log('OnFormChanges: ', val);

            const protocol = this.dataPublisherForm.get('protocol').value;

            this.mqttProtocol = false;
            this.kafkaProtocol = false;
            this.amqpProtocol = false;
            this.httpProtocol = false;

            if (protocol != '') {

                if (protocol == 'MQTT') {
                    this.mqttProtocol = true;
                }
                else if (protocol == 'Kafka') {
                    this.kafkaProtocol = true;
                }
                else if (protocol == 'AMQP') {
                    this.amqpProtocol = true;
                }
                else if (protocol == 'HTTP') {
                    this.httpProtocol = true;
                }

            }

            this.formUpdatedEvent.emit(this.dataPublisherForm.value);
        });
    }

    initForms() {
        this.dataPublisherForm = this.formBuilder.group({
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
    
        this.dataOptionsForm = this.formBuilder.group({
            useReading: [true],
            encodeReadingValue: [false],
            useEnrichedReading: [false],
            encodeEnrichedReadingValue: [false]
        });
    }

    updateProtocolForm(context) {

        if (context != null || context != undefined) {
            console.log('Updating protocolform with context: ', context);

            const protocolId = context.protocolId;
            const protocol = context.protocol;

            // Update protocol form
            console.log('Setting transportviewform protocol to: ', protocol);

            if (protocol == 'MQTT') {

                this.dataPublisherForm.patchValue({
                    protocol: protocol,
                    protocolId: protocolId,
                    logLevel: context.logLevel,
                    mqtt: {
                        hostname: context.mqtt.hostname,
                        port: context.mqtt.port,
                        username: context.mqtt.username,
                        password: context.mqtt.password,
                        caCertificate: context.mqtt.caCertificate,
                        clientCertificate: context.mqtt.clientCertificate,
                        clientKey: context.mqtt.clientKey,
                        topic: context.mqtt.topic,
                        maximumQOS: context.mqtt.maximumQOS
                    }
                });

            }
            else if (protocol == 'Kafka') {

                this.dataPublisherForm.patchValue({
                    protocol: protocol,
                    protocolId: protocolId,
                    logLevel: context.logLevel,
                    kafka: {
                        hostname: context.kafka.hostname,
                        port: context.kafka.port,
                        authMode: context.kafka.authMode,
                        username: context.kafka.username,
                        password: context.kafka.password,
                        clientCertificate: context.kafka.clientCertificate,
                        clientKey: context.clientKey,
                        serverCertificate: context.kafka.serverCertificate,
                        connectionTimeout: context.kafka.connectionTimeout,
                        retryBackoff: context.kafka.retryBackoff,
                        topic: context.kafka.topic,
                        consumerGroupId: context.kafka.consumerGroupId,
                        commitInterval: context.kafka.commitInterval,
                        initialOffset: context.kafka.initialOffset,
                        fetchMinBytes: context.kafka.fetchMinBytes,
                        fetchMaxWait: context.kafka.fetchMaxWait,
                        heartbeatInterval: context.kafka.heartbeatInterval,
                        sessionTimeout: context.kafka.sessionTimeout
                    }
                });
            }
            else if (protocol == 'AMQP') {

                this.dataPublisherForm.patchValue({
                    protocol: protocol,
                    protocolId: protocolId,
                    logLevel: context.logLevel,
                    amqp: {
                        hostname: context.amqp.hostname,
                        port: context.amqp.port,
                        username: context.amqp.username,
                        password: context.amqp.password,
                        exchangeName: context.amqp.exchangeName,
                        exchangeType: context.amqp.exchangeType,
                        routingKey: context.amqp.routingKey,
                        reliable: context.amqp.reliable
                    }
                });
            }
        }
    }

    resetProtocolType() {
        this.dataPublisherForm.patchValue(
            {
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
    }
}
