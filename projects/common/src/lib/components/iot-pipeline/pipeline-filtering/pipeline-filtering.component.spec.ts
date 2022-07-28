import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppConfigService } from '../../../services/config/app-config.service';
import { EdgeService } from '../../../services/edge/edge.service';
import { GraphService } from '@TIBCOSoftware/labs-air-graph-client';

import { PipelineFilteringComponent } from './pipeline-filtering.component';
import { Observable } from 'rxjs';

describe('PipelineFilteringComponent', () => {
    let component: PipelineFilteringComponent;
    let fixture: ComponentFixture<PipelineFilteringComponent>;

    const mockAppConfigService: Partial<AppConfigService> = jasmine.createSpyObj(['getFromConfigOrEnv']);
    const mockGraphService: Partial<GraphService> = jasmine.createSpyObj(['getModels']);
    const mockEdgeService: Partial<EdgeService> = jasmine.createSpyObj(['xxx']);

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PipelineFilteringComponent],
            imports: [HttpClientTestingModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: AppConfigService, useValue: mockAppConfigService },
            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PipelineFilteringComponent);
        component = fixture.componentInstance;
        component.devices = [];
        component.nodeChangeEvent = new Observable<any>();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
