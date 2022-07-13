import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { EdgeService } from '../../../services/edge/edge.service';
import { GraphService } from '@TIBCOSoftware/labs-air-graph-client';
import { Gateway } from '@TIBCOSoftware/labs-air-graph-client';

import { PipelineRuleTextMatchingComponent } from './pipeline-rule-text-matching.component';
import { MatSelectModule } from '@angular/material/select'
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

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
                { provide: EdgeService, useValue: mockEdgeService },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [MatSelectModule, MatInputModule, BrowserAnimationsModule, ReactiveFormsModule]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PipelineRuleTextMatchingComponent);
        component = fixture.componentInstance;
        component.ruleTextMatchingForm = new UntypedFormGroup({});
        component.ruleTextMatchingForm.addControl('device', new UntypedFormControl(''));
        component.resources = [];
        component.nodeChangeEvent = new Observable<any>();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
