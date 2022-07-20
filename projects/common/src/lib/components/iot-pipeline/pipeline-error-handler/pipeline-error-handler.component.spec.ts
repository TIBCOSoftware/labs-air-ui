import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { MatSelectModule } from '@angular/material/select'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { PipelineErrorHandlerComponent } from './pipeline-error-handler.component';

describe('PipelineErrorHandlerComponent', () => {
    let component: PipelineErrorHandlerComponent;
    let fixture: ComponentFixture<PipelineErrorHandlerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PipelineErrorHandlerComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [ReactiveFormsModule, BrowserAnimationsModule, MatSelectModule]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PipelineErrorHandlerComponent);
        component = fixture.componentInstance;
        // component.streamingForm = new FormGroup({});
        // component.streamingForm.addControl('deviceName', new FormControl(''));
        // component.devices = [];
        component.nodeChangeEvent = new Observable<any>();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
