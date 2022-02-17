import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { GraphService } from '../../../services/graph/graph.service';
import { Device, Resource } from '../../../models/iot.model';

import { CommonIotGatewayDiscreteValueComponent } from './iot-gateway-discrete-value.component';

describe('CommonIotGatewayDiscreteValueComponent', () => {
    let component: CommonIotGatewayDiscreteValueComponent;
    let fixture: ComponentFixture<CommonIotGatewayDiscreteValueComponent>;
    const mockGraphService = jasmine.createSpyObj(['getReadings', 'getModels']);
    mockGraphService.getReadings.and.returnValue(of([]));

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CommonIotGatewayDiscreteValueComponent],
            providers: [
                { provide: GraphService, useValue: mockGraphService }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CommonIotGatewayDiscreteValueComponent);
        component = fixture.componentInstance;
        component.device = {} as Device;
        component.instrument = {} as Resource;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
