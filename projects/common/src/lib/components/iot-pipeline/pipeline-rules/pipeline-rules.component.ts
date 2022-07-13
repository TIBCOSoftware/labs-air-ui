import { Component, OnInit, Input, EventEmitter, Output, OnDestroy } from '@angular/core';
import { Device, Resource } from '../../../models/iot.model';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Observable, Subscription } from 'rxjs';

export interface SelectItem {
    value: string;
    viewValue: string;
}

@Component({
    selector: 'app-common-pipeline-rules',
    templateUrl: './pipeline-rules.component.html',
    styleUrls: ['./pipeline-rules.component.css']
})
export class PipelineRulesComponent implements OnInit, OnDestroy {

    @Input() rule: any;
    @Input() devices: Device[];
    @Output() formUpdatedEvent = new EventEmitter<any>();
    @Input() nodeChangeEvent: Observable<any>;
    nodeChangeSubscription: Subscription;
    formChangeSubscription: Subscription;
    ruleForm: UntypedFormGroup;

    conditionResources: Resource[];
    actionResources: Resource[];

    private subscr1: Subscription;
    private subscr2: Subscription;

    logLevels: SelectItem[] = [
        { value: 'INFO', viewValue: 'INFO' },
        { value: 'WARN', viewValue: 'WARN' },
        { value: 'ERROR', viewValue: 'ERROR' },
        { value: 'DEBUG', viewValue: 'DEBUG' }
    ];

    operations: SelectItem[] = [
        { value: '==', viewValue: '==' },
        { value: '>', viewValue: '>' },
        { value: '>=', viewValue: '>=' },
        { value: '<', viewValue: '<' },
        { value: '<=', viewValue: '<=' },
        { value: '!=', viewValue: '!=' }
    ];

    constructor(private formBuilder: UntypedFormBuilder) { }

    ngOnInit(): void {
        this.initForm();
        this.onFormChanges();
        if (this.rule?.data['customdata']) {
            this.updateRuleForm(this.rule.data['customdata'])
        }
    }

    ngOnDestroy(): void {
        this.formChangeSubscription.unsubscribe();
        this.nodeChangeSubscription.unsubscribe();
        this.subscr1.unsubscribe();
        this.subscr2.unsubscribe();
    }

    onConditionDeviceSelected(event) {

        console.log('Condition Device Selected: ', event);

        // Set the resourceDataSource
        const idx = this.getIndexForDevice(event.value);
        this.conditionResources = this.devices[idx].profile.deviceResources as Resource[];
    }

    onActionDeviceSelected(event) {

        console.log('Action Device Selected: ', event);

        // Set the resourceDataSource
        const idx = this.getIndexForDevice(event.value);
        this.actionResources = this.devices[idx].profile.deviceResources as Resource[];
    }

    getIndexForDevice(name: string): number {
        let idx = -1;

        for (let i = 0; i < this.devices.length; i++) {

            if (this.devices[i].name == name) {
                idx = i;
                break;
            }
        }

        return idx;
    }

    onFormChanges(): void {
        this.nodeChangeSubscription = this.nodeChangeEvent.subscribe(node => {
            this.updateRuleForm(node.data['customdata']);
        });
        this.formChangeSubscription = this.ruleForm.valueChanges
            .pipe(debounceTime(200), distinctUntilChanged())
            .subscribe(() => {
                this.formUpdatedEvent.emit(this.ruleForm.value)
            })

        this.subscr1 = this.ruleForm.get('condDevice').valueChanges.subscribe(val => {

            // Set the resourceDataSource
            const idx = this.getIndexForDevice(val);

            if (idx >= 0)
                this.conditionResources = this.devices[idx].profile.deviceResources as Resource[];
        });

        this.subscr2 = this.ruleForm.get('actionDevice').valueChanges.subscribe(val => {

            // Set the resourceDataSource
            const idx = this.getIndexForDevice(val);

            if (idx >= 0)
                this.actionResources = this.devices[idx].profile.deviceResources as Resource[];
        });

    }

    initForm() {
        this.ruleForm = this.formBuilder.group({
            name: ['', Validators.required],
            description: [''],
            condDevice: ['', Validators.required],
            condResource: ['', Validators.required],
            condCompareNewMetricToValue: [true],
            condCompareNewMetricToValueOp: ['', Validators.required],
            condCompareNewMetricValue: ['', Validators.required],
            condCompareNewMetricToLastMetric: [false],
            condCompareNewMetricToLastMetricOp: [''],
            condCompareLastMetricToValue: [false],
            condCompareLastMetricToValueOp: [''],
            condCompareLastMetricValue: [''],
            actionSendNotification: [true],
            actionNotification: ['', Validators.required],
            actionSendCommand: [true],
            actionDevice: ['', Validators.required],
            actionResource: ['', Validators.required],
            actionValue: ['', Validators.required],
            logLevel: ['INFO', Validators.required]
        });
        let idx = this.getIndexForDevice(this.ruleForm.get('condDevice').value);

        if (idx >= 0)
            this.conditionResources = this.devices[idx].profile.deviceResources as Resource[];

        idx = this.getIndexForDevice(this.ruleForm.get('actionDevice').value);

        if (idx >= 0)
            this.actionResources = this.devices[idx].profile.deviceResources as Resource[];
    }

    updateRuleForm(context) {

        if (context != null || context != undefined) {
            console.log('Updating rules component with context: ', context);

            this.ruleForm.patchValue({
                name: context.name,
                description: context.description,
                condDevice: context.condDevice,
                condResource: context.condResource,
                condCompareNewMetricToValue: context.condCompareNewMetricToValue,
                condCompareNewMetricToValueOp: context.condCompareNewMetricToValueOp,
                condCompareNewMetricValue: context.condCompareNewMetricValue,
                condCompareNewMetricToLastMetric: context.condCompareNewMetricToLastMetric,
                condCompareNewMetricToLastMetricOp: context.condCompareNewMetricToLastMetricOp,
                condCompareLastMetricToValue: context.condCompareLastMetricToValue,
                condCompareLastMetricToValueOp: context.condCompareLastMetricToValueOp,
                condCompareLastMetricValue: context.condCompareLastMetricValue,
                actionSendNotification: context.actionSendNotification,
                actionNotification: context.actionNotification,
                actionSendCommand: context.actionSendCommand,
                actionDevice: context.actionDevice,
                actionResource: context.actionResource,
                actionValue: context.actionValue,
                logLevel: context.logLevel,
            });

        }
    }

}
