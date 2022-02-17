import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AppConfigService } from '../../services/config/app-config.service';
import { EdgeService } from '../../services/edge/edge.service';
import { GraphService } from '../../services/graph/graph.service';

import { CommonIotEdgeDataPipelineComponent } from './iot-edge-data-pipeline.component';

describe('CommonIotEdgeDataPipelineComponent', () => {
    let component: CommonIotEdgeDataPipelineComponent;
    let fixture: ComponentFixture<CommonIotEdgeDataPipelineComponent>;

    const mockAppConfigService: Partial<AppConfigService> = jasmine.createSpyObj(['getFromConfigOrEnv']);
    const mockGraphService = jasmine.createSpyObj(['getGateway', 'getModels']);
    const mockEdgeService = jasmine.createSpyObj(['getDevices']);

    mockGraphService.getGateway.and.returnValue(of({

    }));

    mockEdgeService.getDevices.and.returnValue(of([]));

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CommonIotEdgeDataPipelineComponent],
            imports: [HttpClientTestingModule, RouterTestingModule, ReactiveFormsModule, MatSnackBarModule],
            providers: [
                { provide: AppConfigService, useValue: mockAppConfigService },
                { provide: GraphService, useValue: mockGraphService },
                { provide: EdgeService, useValue: mockEdgeService }
            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CommonIotEdgeDataPipelineComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
