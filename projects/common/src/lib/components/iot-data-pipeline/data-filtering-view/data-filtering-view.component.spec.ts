import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {  ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { of } from 'rxjs';
import { AppConfigService } from '../../../services/config/app-config.service';
import { GraphService } from '../../../services/graph/graph.service';

import { DataFilteringViewComponent } from './data-filtering-view.component';

describe('DataFilteringViewComponent', () => {
    let component: DataFilteringViewComponent;
    let fixture: ComponentFixture<DataFilteringViewComponent>;

    const mockAppConfigService: Partial<AppConfigService> = jasmine.createSpyObj(['getFromConfigOrEnv', 'loadAppConfig']);
    const mockGraphService = jasmine.createSpyObj(['getGateways', 'getGatewayAndPipelines', 'getModels']);

    mockGraphService.getGateways.and.returnValue(of([]));

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [DataFilteringViewComponent],
            providers: [
                { provide: AppConfigService, useValue: mockAppConfigService },
                { provide: GraphService, useValue: mockGraphService }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DataFilteringViewComponent);
        component = fixture.componentInstance;
        component.filteringForm = new FormGroup({});
        component.filteringForm.addControl('deviceNames', new FormArray([]));
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
