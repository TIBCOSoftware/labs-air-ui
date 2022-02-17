import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppConfigService } from '../../../services/config/app-config.service';
import { GraphService } from '../../../services/graph/graph.service';

import { PipelineRestServiceComponent } from './pipeline-rest-service.component';

describe('PipelineRestServiceComponent', () => {
    let component: PipelineRestServiceComponent;
    let fixture: ComponentFixture<PipelineRestServiceComponent>;

    const mockAppConfigService: Partial<AppConfigService>  = jasmine.createSpyObj(['getFromConfigOrEnv']);
    const mockGraphService: Partial < GraphService > = jasmine.createSpyObj(['getModels']);

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PipelineRestServiceComponent],
            imports: [HttpClientTestingModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: AppConfigService, useValue: mockAppConfigService },
                { provide: GraphService, useValue: mockGraphService }
            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PipelineRestServiceComponent);
        component = fixture.componentInstance;
        component.devices = [];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
