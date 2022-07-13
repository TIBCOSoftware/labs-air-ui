import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Device, Resource } from '../../../models/iot.model';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Observable, Subscription } from 'rxjs';

export interface SelectItem {
    value: string;
    viewValue: string;
}

@Component({
    selector: 'app-common-pipeline-rule-expression',
    templateUrl: './pipeline-rule-expression.component.html',
    styleUrls: ['./pipeline-rule-expression.component.css']
})
export class PipelineRuleExpressionComponent implements OnInit, OnDestroy {

    @Input() ruleExpression: any;
    @Input() devices: Device[];
    @Output() formUpdatedEvent = new EventEmitter<any>();
    @Input() nodeChangeEvent: Observable<any>;
    nodeChangeSubscription: Subscription;
    formChangeSubscription: Subscription;
    ruleExpressionForm: UntypedFormGroup;

    resources: Resource[];

    private subscr1: Subscription;

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
        { value: 'contains', viewValue: 'contains' }
    ];

    constructor(private formBuilder: UntypedFormBuilder) { }

    ngOnInit(): void {
        this.initForm();
        this.onFormChanges();
        if (this.ruleExpression?.data['customdata']) {
            this.updateRuleExpressionForm(this.ruleExpression.data['customdata']);
            const idx = this.getIndexForDevice(this.ruleExpressionForm.get('device').value);

            if (idx >= 0) {
                this.resources = this.devices[idx].profile.deviceResources as Resource[];
            }
        }
    }

    ngOnDestroy(): void {
        this.formChangeSubscription.unsubscribe();
        this.nodeChangeSubscription.unsubscribe();
    }

    onDeviceSelected(event) {

        console.log('Device Selected: ', event);

        // Set the resourceDataSource
        const idx = this.getIndexForDevice(event.value);
        this.resources = this.devices[idx].profile.deviceResources as Resource[];
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
            this.updateRuleExpressionForm(node.data['customdata']);
        });
        this.formChangeSubscription = this.ruleExpressionForm.valueChanges
            .pipe(debounceTime(200), distinctUntilChanged())
            .subscribe(() => {
                this.formUpdatedEvent.emit(this.ruleExpressionForm.value)
            })

        this.subscr1 = this.ruleExpressionForm.get('device').valueChanges.subscribe(val => {

            console.log('Device changed: ', val);

            // Set the resourceDataSource
            const idx = this.getIndexForDevice(val);

            console.log('Got index: ', idx);


            if (idx >= 0)
                this.resources = this.devices[idx].profile.deviceResources as Resource[];
        });
    }

    initForm() {
        this.ruleExpressionForm = this.formBuilder.group({
            name: ['', Validators.required],
            description: [''],
            device: ['', Validators.required],
            resource: ['', Validators.required],
            compareOp: ['', Validators.required],
            compareToValue: ['', Validators.required],
            notification: ['', Validators.required],
            notificationLevel: ['INFO', Validators.required],
            logLevel: ['INFO', Validators.required]
        });
    }

    updateRuleExpressionForm(context) {
        if (context != null || context != undefined) {
            console.log('Updating rules component with context: ', context);

            this.ruleExpressionForm.patchValue({
                name: context.name,
                description: context.description,
                device: context.device,
                resource: context.resource,
                compareOp: context.compareOp,
                compareToValue: context.compareToValue,
                notification: context.notification,
                notificationLevel: context.notificationLevel,
                logLevel: context.logLevel,
            });

        }
    }

}
