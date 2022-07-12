import { Component, OnInit, OnDestroy, Input, EventEmitter, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Device, Resource } from '../../../models/iot.model';
import { debounceTime, distinctUntilChanged, Observable, Subscription } from 'rxjs';

export interface SelectItem {
    value: string;
    viewValue: string;
}

@Component({
    selector: 'app-common-pipeline-streaming',
    templateUrl: './pipeline-streaming.component.html',
    styleUrls: ['./pipeline-streaming.component.css']
})
export class PipelineStreamingComponent implements OnInit, OnDestroy {

    @Input() streaming: any;
    @Input() devices: Device[];
    @Output() formUpdatedEvent = new EventEmitter<any>();
    @Input() nodeChangeEvent: Observable<any>;
    nodeChangeSubscription: Subscription;
    formChangeSubscription: Subscription;
    streamingForm: UntypedFormGroup;

    logLevels: SelectItem[] = [
        { value: 'INFO', viewValue: 'INFO' },
        { value: 'WARN', viewValue: 'WARN' },
        { value: 'ERROR', viewValue: 'ERROR' },
        { value: 'DEBUG', viewValue: 'DEBUG' }
    ];

    instruments: Resource[] = [];
    private subscr: Subscription;


    functions: SelectItem[] = [
        { value: 'avg', viewValue: 'AVG' },
        { value: 'sum', viewValue: 'SUM' },
        { value: 'min', viewValue: 'MIN' },
        { value: 'max', viewValue: 'MAX' },
        { value: 'count', viewValue: 'COUNT' },
        { value: 'accumulate', viewValue: 'ACCUMULATE' }
    ];

    windowTypes: SelectItem[] = [
        { value: 'tumbling', viewValue: 'TUMBLING' },
        { value: 'sliding', viewValue: 'SLIDING' },
        { value: 'timeTumbling', viewValue: 'TIME TUMBLING' },
        { value: 'timeSliding', viewValue: 'TIME SLIDING' }
    ];

    constructor(private formBuilder: UntypedFormBuilder) { }

    ngOnInit(): void {
        this.initForm();
        this.onFormChanges();
        if (this.streaming) {
            this.updateStreamingForm(this.streaming.data['customdata'])
        }
    }

    ngOnDestroy(): void {
        this.formChangeSubscription.unsubscribe();
        this.nodeChangeSubscription.unsubscribe();
        this.subscr.unsubscribe();
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
        // this.streamingForm.valueChanges.subscribe(val => {
        //   console.log("streamingForm has changed for: ", val.name);

        // });

        this.nodeChangeSubscription = this.nodeChangeEvent.subscribe(node => {
            this.updateStreamingForm(node.data['customdata']);
        });
        this.formChangeSubscription = this.streamingForm.valueChanges
            .pipe(debounceTime(200), distinctUntilChanged())
            .subscribe(() => {
                this.formUpdatedEvent.emit(this.streamingForm.value)
            })

        this.subscr = this.streamingForm.get('deviceName').valueChanges.subscribe(val => {

            // Set the resourceDataSource
            const idx = this.getIndexForDevice(val);

            if (idx >= 0)
                this.instruments = this.devices[idx].profile.deviceResources as Resource[];
        });

    }

    initForm() {
        this.streamingForm = this.formBuilder.group({
            deviceName: ['changeme', Validators.required],
            instrumentName: ['changeme', Validators.required],
            function: ['avg', Validators.required],
            windowType: ['tumbling', Validators.required],
            windowSize: ['5', Validators.required],
            logLevel: ['INFO', Validators.required]
        });
    }

    updateStreamingForm(context) {

        if (context != null || context != undefined) {
            console.log('Updating streaming component with context: ', context);

            this.streamingForm.patchValue({
                deviceName: context.deviceName,
                instrumentName: context.instrumentName,
                function: context.function,
                windowType: context.windowType,
                windowSize: context.windowSize,
                logLevel: context.logLevel,
            });
        }
    }

}
