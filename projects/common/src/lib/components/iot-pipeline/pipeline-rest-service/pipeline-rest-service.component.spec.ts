import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppConfigService } from '../../../services/config/app-config.service';
import { GraphService } from '@TIBCOSoftware/labs-air-graph-client';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select'
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { PipelineRestServiceComponent } from './pipeline-rest-service.component';
import { Observable } from 'rxjs';

describe('PipelineRestServiceComponent', () => {
    let component: PipelineRestServiceComponent;
    let fixture: ComponentFixture<PipelineRestServiceComponent>;

    const mockAppConfigService: Partial<AppConfigService>  = jasmine.createSpyObj(['getFromConfigOrEnv']);
    const mockGraphService: Partial < GraphService > = jasmine.createSpyObj(['getModels']);

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PipelineRestServiceComponent],
            imports: [HttpClientTestingModule, ReactiveFormsModule, BrowserAnimationsModule, MatSelectModule, MatInputModule],
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
        component.nodeChangeEvent = new Observable<any>();
        component.devices = [];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
