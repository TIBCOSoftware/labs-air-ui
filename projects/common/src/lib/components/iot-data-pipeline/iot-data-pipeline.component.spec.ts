import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AppConfigService } from '../../services/config/app-config.service';
import { EdgeService } from '../../services/edge/edge.service';
import { GraphService } from '../../services/graph/graph.service';
import { Gateway, Pipeline } from '../../models/iot.model';

import { CommonIotDataPipelineComponent } from './iot-data-pipeline.component';

describe('CommonIotDataPipelineComponent', () => {
    let component: CommonIotDataPipelineComponent;
    let fixture: ComponentFixture<CommonIotDataPipelineComponent>;


    const mockGraphService = jasmine.createSpyObj(['getGatewayAndPipelines', 'getModels']);
    const mockAppConfigService: Partial<AppConfigService> = jasmine.createSpyObj(['getFromConfigOrEnv']);
    const mockEdgeService = jasmine.createSpyObj(['getDevices']);

    mockGraphService.getGatewayAndPipelines.and.returnValue(of([new Gateway()] as Gateway[]));
    mockEdgeService.getDevices.and.returnValue(of([]));

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [CommonIotDataPipelineComponent],
            imports: [HttpClientTestingModule, RouterTestingModule, ReactiveFormsModule, MatSnackBarModule],
            providers: [
                { provide: AppConfigService, useValue: mockAppConfigService },
                { provide: GraphService, useValue: mockGraphService },
                { provide: EdgeService, useValue: mockEdgeService }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CommonIotDataPipelineComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
