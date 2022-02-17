import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { AppConfigService } from '../../../services/config/app-config.service';
import { GraphService } from '../../../services/graph/graph.service';
import { RtsfSimulatorService } from '../../../services/simulator/rtsf-simulator.service';

import { CommonIotStoreSimulatorComponent } from './iot-store-simulator.component';

describe('CommonIotStoreSimulatorComponent', () => {
    let component: CommonIotStoreSimulatorComponent;
    let fixture: ComponentFixture<CommonIotStoreSimulatorComponent>;

    const mockAppConfigService: Partial<AppConfigService> = jasmine.createSpyObj(['getFromConfigOrEnv']);
    const mockSimulatorService = jasmine.createSpyObj(['getProducts', 'subscribe']);
    const mockGraphService = jasmine.createSpyObj(['getNotifications', 'getModels']);

    mockSimulatorService.getProducts.and.returnValue(of({

    }));

    mockGraphService.getNotifications.and.returnValue(of({

    }));

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CommonIotStoreSimulatorComponent],
            imports: [HttpClientTestingModule, MatSnackBarModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: RtsfSimulatorService, useValue: mockSimulatorService },
                { provide: AppConfigService, useValue: mockAppConfigService },
                { provide: GraphService, useValue: mockGraphService }
            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CommonIotStoreSimulatorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
