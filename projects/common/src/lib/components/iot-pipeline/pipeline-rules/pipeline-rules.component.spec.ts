import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, FormControl } from '@angular/forms';
import { of } from 'rxjs';
import { GraphService } from '../../../services/graph/graph.service';

import { PipelineRulesComponent } from './pipeline-rules.component';

describe('PipelineRulesComponent', () => {
    let component: PipelineRulesComponent;
    let fixture: ComponentFixture<PipelineRulesComponent>;

    const mockGraphService = jasmine.createSpyObj(['getReadings', 'getModels']);
    mockGraphService.getReadings.and.returnValue(of([]));

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PipelineRulesComponent],
            providers: [
                { provide: GraphService, useValue: mockGraphService }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PipelineRulesComponent);
        component = fixture.componentInstance;
        component.ruleForm = new FormGroup({});
        component.ruleForm.addControl('condDevice', new FormControl(''));
        component.ruleForm.addControl('actionDevice', new FormControl(''));
        component.devices = [];
        fixture.detectChanges();
    });

    it('should create it', () => {
        expect(component).toBeTruthy();
    });
});
