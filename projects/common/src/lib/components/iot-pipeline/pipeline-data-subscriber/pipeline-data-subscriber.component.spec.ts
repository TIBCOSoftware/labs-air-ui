import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { of } from 'rxjs';
import { GraphService } from '../../../services/graph/graph.service';

import { PipelineDataSubscriberComponent } from './pipeline-data-subscriber.component';

describe('PipelineDataSubscriberComponent', () => {
    let component: PipelineDataSubscriberComponent;
    let fixture: ComponentFixture<PipelineDataSubscriberComponent>;

    const mockGraphService = jasmine.createSpyObj(['getProtocols', 'getModels']);
    mockGraphService.getProtocols.and.returnValue(of([]));

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PipelineDataSubscriberComponent],
            imports: [HttpClientTestingModule],
            providers: [
                { provide: GraphService, useValue: mockGraphService }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PipelineDataSubscriberComponent);
        component = fixture.componentInstance;
        component.dataSubscriberForm = new FormGroup({});
        component.dataSubscriberForm.addControl('gateway', new FormControl(''));
        component.dataSubscriberForm.addControl('protocolId', new FormControl(''));
        component.dataSubscriberForm.addControl('logLevel', new FormControl(''));
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
