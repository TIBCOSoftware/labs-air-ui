import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';

import { PipelineErrorHandlerComponent } from './pipeline-error-handler.component';

describe('PipelineErrorHandlerComponent', () => {
    let component: PipelineErrorHandlerComponent;
    let fixture: ComponentFixture<PipelineErrorHandlerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PipelineErrorHandlerComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PipelineErrorHandlerComponent);
        component = fixture.componentInstance;
        // component.streamingForm = new FormGroup({});
        // component.streamingForm.addControl('deviceName', new FormControl(''));
        // component.devices = [];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
