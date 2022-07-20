import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GraphService } from '@TIBCOSoftware/labs-air-graph-client';
import { ReactiveFormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { MatSelectModule } from '@angular/material/select'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { PipelineDataSubscriberComponent } from './pipeline-data-subscriber.component';

describe('PipelineDataSubscriberComponent', () => {
    let component: PipelineDataSubscriberComponent;
    let fixture: ComponentFixture<PipelineDataSubscriberComponent>;

    const mockGraphService = jasmine.createSpyObj(['getProtocols', 'getModels']);
    mockGraphService.getProtocols.and.returnValue(of([]));

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PipelineDataSubscriberComponent],
            imports: [HttpClientTestingModule, ReactiveFormsModule, MatSelectModule, BrowserAnimationsModule],
            providers: [
                { provide: GraphService, useValue: mockGraphService, }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PipelineDataSubscriberComponent);
        component = fixture.componentInstance;
        component.nodeChangeEvent = new Observable<any>();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
