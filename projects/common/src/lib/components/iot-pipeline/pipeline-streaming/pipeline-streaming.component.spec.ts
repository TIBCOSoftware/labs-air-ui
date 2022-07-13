import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Observable } from 'rxjs';

import { PipelineStreamingComponent } from './pipeline-streaming.component';

describe('PipelineStreamingComponent', () => {
    let component: PipelineStreamingComponent;
    let fixture: ComponentFixture<PipelineStreamingComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PipelineStreamingComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [ReactiveFormsModule, MatSelectModule, MatInputModule, BrowserAnimationsModule]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PipelineStreamingComponent);
        component = fixture.componentInstance;
        component.nodeChangeEvent = new Observable<any>();
        component.devices = [];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
