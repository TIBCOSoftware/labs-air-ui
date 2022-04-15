import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { AppConfigService } from '../../services/config/app-config.service';
import { GraphService } from '@TIBCOSoftware/labs-air-graph-client';

import { CommonIotGatewayComponent } from './iot-gateway.component';
import { DatePipe } from '@angular/common';

describe('CommonIotGatewayComponent', () => {
    let component: CommonIotGatewayComponent;
    let fixture: ComponentFixture<CommonIotGatewayComponent>;

    const mockAppConfigService: Partial<AppConfigService> = jasmine.createSpyObj(['getFromConfigOrEnv', 'loadAppConfig']);
    const mockGraphService = jasmine.createSpyObj(['getGateways', 'getGatewayAndPipelines', 'getModels']);

    mockGraphService.getGateways.and.returnValue(of([]));

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [CommonIotGatewayComponent],
            imports: [HttpClientTestingModule, ReactiveFormsModule, MatSnackBarModule],
            providers: [
                { provide: AppConfigService, useValue: mockAppConfigService },
                { provide: GraphService, useValue: mockGraphService },
                DatePipe
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CommonIotGatewayComponent);
        component = fixture.componentInstance;
        component.gatewayForm = new FormGroup({});
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
