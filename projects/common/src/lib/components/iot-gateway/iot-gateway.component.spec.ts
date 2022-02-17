import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { CommonLibraryModule } from '../../common-library.module';
import { AppConfigService } from '../../services/config/app-config.service';
import { GraphService } from '../../services/graph/graph.service';

import { CommonIotGatewayComponent } from './iot-gateway.component';

describe('CommonIotGatewayComponent', () => {
    let component: CommonIotGatewayComponent;
    let fixture: ComponentFixture<CommonIotGatewayComponent>;

    const mockAppConfigService: Partial<AppConfigService> = jasmine.createSpyObj(['getFromConfigOrEnv', 'loadAppConfig']);
    const mockGraphService = jasmine.createSpyObj(['getGateways', 'getGatewayAndPipelines', 'getModels']);

    mockGraphService.getGateways.and.returnValue(of([]));

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [CommonIotGatewayComponent],
            imports: [HttpClientTestingModule, ReactiveFormsModule, MatSnackBarModule, CommonLibraryModule],
            providers: [
                { provide: AppConfigService, useValue: mockAppConfigService },
                { provide: GraphService, useValue: mockGraphService }
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
