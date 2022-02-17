import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { of } from 'rxjs';
import { EdgeService } from '../../../services/edge/edge.service';
import { GraphService } from '../../../services/graph/graph.service';
import { Gateway } from '../../../models/iot.model';

import { PipelineRuleExpressionComponent } from './pipeline-rule-expression.component';

describe('PipelineRuleExpressionComponent', () => {
    let component: PipelineRuleExpressionComponent;
    let fixture: ComponentFixture<PipelineRuleExpressionComponent>;

    const mockGraphService = jasmine.createSpyObj(['getGatewayAndPipelines', 'addPipeline', 'getModels']);
    const mockEdgeService: Partial<EdgeService> = jasmine.createSpyObj(['xxx']);

    mockGraphService.getGatewayAndPipelines.and.returnValue(of([new Gateway()] as Gateway[]));

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PipelineRuleExpressionComponent],
            providers: [
                { provide: GraphService, useValue: mockGraphService },
                { provide: EdgeService, useValue: mockEdgeService }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PipelineRuleExpressionComponent);
        component = fixture.componentInstance;
        component.ruleExpressionForm = new FormGroup({});
        component.ruleExpressionForm.addControl('device', new FormControl(''));
        component.devices = [];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
