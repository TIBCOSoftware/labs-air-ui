import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { AppConfigService } from '../../../services/config/app-config.service';
import { EdgeService } from '../../../services/edge/edge.service';
import { GraphService } from '@TIBCOSoftware/labs-air-graph-client';
import { Observable } from 'rxjs';
import { MatSelectModule } from '@angular/material/select'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';

import { PipelineInferencingComponent } from './pipeline-inferencing.component';

describe('PipelineInferencingComponent', () => {
    let component: PipelineInferencingComponent;
    let fixture: ComponentFixture<PipelineInferencingComponent>;

    const mockAppConfigService: Partial<AppConfigService> = jasmine.createSpyObj(['getFromConfigOrEnv']);
    const mockGraphService: Partial<GraphService> = jasmine.createSpyObj(['getGatewayAndPipelines', 'getModels']);
    const mockEdgeService: Partial<EdgeService> = jasmine.createSpyObj(['getDevices']);

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PipelineInferencingComponent],
            imports: [HttpClientTestingModule, ReactiveFormsModule, MatSelectModule, MatInputModule, BrowserAnimationsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: AppConfigService, useValue: mockAppConfigService },
                { provide: GraphService, useValue: mockGraphService },
                { provide: EdgeService, useValue: mockEdgeService },
                UntypedFormBuilder
            ]

        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PipelineInferencingComponent);
        component = fixture.componentInstance;
        component.devices = [];
        component.modelForm = new UntypedFormGroup({});
        component.nodeChangeEvent = new Observable<any>();
        fixture.detectChanges();
    });

    it('should create PipelineInferencingComponent', () => {
        expect(component).toBeTruthy();
    });
});
