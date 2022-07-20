import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { GraphService } from '@TIBCOSoftware/labs-air-graph-client';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { PipelineRulesComponent } from './pipeline-rules.component';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

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
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [ReactiveFormsModule, MatSelectModule, MatCheckboxModule, MatInputModule, BrowserAnimationsModule]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PipelineRulesComponent);
        component = fixture.componentInstance;
        component.nodeChangeEvent = new Observable<any>();
        component.devices = [];
        fixture.detectChanges();
    });

    it('should create it', () => {
        expect(component).toBeTruthy();
    });
});
