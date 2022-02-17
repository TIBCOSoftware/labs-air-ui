import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { GraphService } from '../../../services/graph/graph.service';
import { Device, Resource } from '../../../models/iot.model';

import { CommonIotGatewayLocationComponent } from './iot-gateway-location.component';

describe('CommonIotGatewayLocationComponent', () => {
    let component: CommonIotGatewayLocationComponent;
    let fixture: ComponentFixture<CommonIotGatewayLocationComponent>;
    const mockGraphService = jasmine.createSpyObj(['getReadings', 'getModels']);
    mockGraphService.getReadings.and.returnValue(of([]));

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CommonIotGatewayLocationComponent],
            imports: [ReactiveFormsModule],
            providers: [
                { provide: GraphService, useValue: mockGraphService }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CommonIotGatewayLocationComponent);
        component = fixture.componentInstance;
        component.device = {} as Device;
        component.instrument = { properties: { units: {}}} as Resource;
        component.instrumentForm = new FormGroup({});
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
