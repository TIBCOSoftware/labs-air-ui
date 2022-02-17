import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { CommonLibraryModule } from '../../../common-library.module';
import { AppConfigService } from '../../../services/config/app-config.service';
import { GraphService } from '../../../services/graph/graph.service';
import { Device, Gateway } from '../../../models/iot.model';

import { InferencingComponent } from './inferencing.component';

describe('InferencingComponent', () => {
    let component: InferencingComponent;
    let fixture: ComponentFixture<InferencingComponent>;

    const mockAppConfigService: Partial<AppConfigService> = jasmine.createSpyObj(['getFromConfigOrEnv', 'loadAppConfig']);
    const mockGraphService = jasmine.createSpyObj(['getModelConfigs', 'getModels']);
    mockGraphService.getModelConfigs.and.returnValue(of([]));

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [InferencingComponent],
            imports: [HttpClientTestingModule, CommonLibraryModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: AppConfigService, useValue: mockAppConfigService },
                { provide: GraphService, useValue: mockGraphService }
            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(InferencingComponent);
        component = fixture.componentInstance;
        component.devices = [] as Device[];
        component.gateway = {} as Gateway;
        component.modelForm = new FormGroup({});
        component.modelForm.addControl('device', new FormControl(''));
        fixture.detectChanges();
    });

    it('should create InferencingComponent', () => {
        expect(component).toBeTruthy();
    });
});
