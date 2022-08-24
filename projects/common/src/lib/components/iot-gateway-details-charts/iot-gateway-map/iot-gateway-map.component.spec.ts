import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { GraphService } from '@TIBCOSoftware/labs-air-graph-client';
import { Device, Resource } from '../../../models/iot.model';

import { CommonIotGatewayMapComponent } from './iot-gateway-map.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('CommonIotGatewayMapComponent', () => {
    let component: CommonIotGatewayMapComponent;
    let fixture: ComponentFixture<CommonIotGatewayMapComponent>;
    const mockGraphService = jasmine.createSpyObj(['getReadings', 'getGateways', 'getGatewayAndPipelines', 'getModels']);
    mockGraphService.getReadings.and.returnValue(of([]));

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CommonIotGatewayMapComponent],
            providers: [
                { provide: GraphService, useValue: mockGraphService }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [RouterTestingModule]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CommonIotGatewayMapComponent);
        component = fixture.componentInstance;
        component.device = {} as Device;
        component.instrument = { properties: { units: {} } } as Resource;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
