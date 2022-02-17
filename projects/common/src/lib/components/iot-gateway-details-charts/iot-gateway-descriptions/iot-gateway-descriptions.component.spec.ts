import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Device, Resource } from '../../../models/iot.model';

import { CommonIotGatewayDescriptionsComponent } from './iot-gateway-descriptions.component';

describe('CommonIotGatewayDescriptionsComponent', () => {
    let component: CommonIotGatewayDescriptionsComponent;
    let fixture: ComponentFixture<CommonIotGatewayDescriptionsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CommonIotGatewayDescriptionsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CommonIotGatewayDescriptionsComponent);
        component = fixture.componentInstance;
        component.device = {} as Device;
        component.instrument = { properties: { units: {}}} as Resource;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
