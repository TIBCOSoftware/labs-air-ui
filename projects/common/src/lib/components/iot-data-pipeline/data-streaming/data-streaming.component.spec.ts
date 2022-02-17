import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Device } from '../../../models/iot.model';

import { DataStreamingComponent } from './data-streaming.component';

describe('DataStreamingComponent', () => {
    let component: DataStreamingComponent;
    let fixture: ComponentFixture<DataStreamingComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [DataStreamingComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DataStreamingComponent);
        component = fixture.componentInstance;
        component.devices = [] as Device[];

        fixture.detectChanges();
    });

    it('should create DataStreamingComponent', () => {
        expect(component).toBeTruthy();
    });
});
