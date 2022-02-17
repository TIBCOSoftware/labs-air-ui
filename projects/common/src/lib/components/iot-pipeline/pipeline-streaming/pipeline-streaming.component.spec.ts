import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';

import { PipelineStreamingComponent } from './pipeline-streaming.component';

describe('PipelineStreamingComponent', () => {
    let component: PipelineStreamingComponent;
    let fixture: ComponentFixture<PipelineStreamingComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PipelineStreamingComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PipelineStreamingComponent);
        component = fixture.componentInstance;
        component.streamingForm = new FormGroup({});
        component.streamingForm.addControl('deviceName', new FormControl(''));
        component.devices = [];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
