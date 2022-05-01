import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { of } from 'rxjs';
import { EdgeService } from '../../../services/edge/edge.service';
import { GraphService } from '@TIBCOSoftware/labs-air-graph-client';
import { Gateway } from '@TIBCOSoftware/labs-air-graph-client';

import { PipelineRuleTextMatchingComponent } from './pipeline-rule-text-matching.component';

describe('PipelineRuleTextMatchingComponent', () => {
    let component: PipelineRuleTextMatchingComponent;
    let fixture: ComponentFixture<PipelineRuleTextMatchingComponent>;

    const mockGraphService = jasmine.createSpyObj(['getGatewayAndPipelines', 'addPipeline', 'getModels']);
    const mockEdgeService: Partial<EdgeService> = jasmine.createSpyObj(['xxx']);

    mockGraphService.getGatewayAndPipelines.and.returnValue(of([{}] as Gateway[]));

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PipelineRuleTextMatchingComponent],
            providers: [
                { provide: GraphService, useValue: mockGraphService },
                { provide: EdgeService, useValue: mockEdgeService }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PipelineRuleTextMatchingComponent);
        component = fixture.componentInstance;
        component.ruleTextMatchingForm = new FormGroup({});
        component.ruleTextMatchingForm.addControl('device', new FormControl(''));
        component.devices = [];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
