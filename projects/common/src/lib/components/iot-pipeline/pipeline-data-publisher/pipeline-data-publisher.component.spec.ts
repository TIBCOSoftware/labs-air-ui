import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { EdgeService } from '../../../services/edge/edge.service';
import { GraphService } from '@TIBCOSoftware/labs-air-graph-client';
import { ReactiveFormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { MatSelectModule } from '@angular/material/select'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { PipelineDataPublisherComponent } from './pipeline-data-publisher.component';

describe('PipelineDataPublisherComponent', () => {
    let component: PipelineDataPublisherComponent;
    let fixture: ComponentFixture<PipelineDataPublisherComponent>;

    const mockGraphService = jasmine.createSpyObj(['getProtocols', 'getModels']);
    const mockEdgeService: Partial<EdgeService> = jasmine.createSpyObj(['getDevices']);

    mockGraphService.getProtocols.and.returnValue(of([]));

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PipelineDataPublisherComponent],
            providers: [
                { provide: GraphService, useValue: mockGraphService },
                { provide: EdgeService, useValue: mockEdgeService }
            ],
            imports: [ReactiveFormsModule, MatSelectModule, MatCheckboxModule, BrowserAnimationsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PipelineDataPublisherComponent);
        component = fixture.componentInstance;
        component.dataPublisherForm = new UntypedFormGroup({});
        component.dataPublisherForm.addControl('gateway', new UntypedFormControl(''));
        component.dataPublisherForm.addControl('protocolId', new UntypedFormControl(''));
        component.nodeChangeEvent = new Observable<any>();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
