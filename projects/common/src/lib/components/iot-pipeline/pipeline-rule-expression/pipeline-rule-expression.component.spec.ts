import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { EdgeService } from '../../../services/edge/edge.service';
import { GraphService } from '@TIBCOSoftware/labs-air-graph-client';
import { Gateway } from '@TIBCOSoftware/labs-air-graph-client';
import { MatSelectModule } from '@angular/material/select'
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { PipelineRuleExpressionComponent } from './pipeline-rule-expression.component';

describe('PipelineRuleExpressionComponent', () => {
    let component: PipelineRuleExpressionComponent;
    let fixture: ComponentFixture<PipelineRuleExpressionComponent>;

    const mockGraphService = jasmine.createSpyObj(['getGatewayAndPipelines', 'addPipeline', 'getModels']);
    const mockEdgeService: Partial<EdgeService> = jasmine.createSpyObj(['xxx']);

    mockGraphService.getGatewayAndPipelines.and.returnValue(of([{}] as Gateway[]));

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PipelineRuleExpressionComponent],
            providers: [
                { provide: GraphService, useValue: mockGraphService },
                { provide: EdgeService, useValue: mockEdgeService }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [ReactiveFormsModule, MatSelectModule, MatInputModule, BrowserAnimationsModule]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PipelineRuleExpressionComponent);
        component = fixture.componentInstance;
        component.nodeChangeEvent = new Observable<any>();
        component.devices = [];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
