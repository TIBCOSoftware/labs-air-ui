import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { EdgeService } from '../../../services/edge/edge.service';
import { GraphService } from '../../../services/graph/graph.service';
import { Device, Resource } from '../../../models/iot.model';

import { CommonIotGatewayTextComponent } from './iot-gateway-text.component';

describe('CommonIotGatewayTextComponent', () => {
    let component: CommonIotGatewayTextComponent;
    let fixture: ComponentFixture<CommonIotGatewayTextComponent>;

    const mockGraphService = jasmine.createSpyObj(['getReadings', 'getModels']);
    mockGraphService.getReadings.and.returnValue(of([]));
    const mockEdgeService = jasmine.createSpyObj(['getDevices']);

    mockGraphService.getReadings.and.returnValue(of([]));

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CommonIotGatewayTextComponent],
            providers: [
                { provide: GraphService, useValue: mockGraphService },
                { provide: EdgeService, useValue: mockEdgeService }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CommonIotGatewayTextComponent);
        component = fixture.componentInstance;
        component.device = {} as Device;
        component.instrument = { name: 'myName', properties: { units: {} } } as Resource;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
