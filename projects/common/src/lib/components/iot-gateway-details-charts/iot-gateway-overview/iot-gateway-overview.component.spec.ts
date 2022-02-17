import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Device, Resource } from '../../../models/iot.model';

import { CommonIotGatewayOverviewComponent } from './iot-gateway-overview.component';

describe('CommonIotGatewayOverviewComponent', () => {
    let component: CommonIotGatewayOverviewComponent;
    let fixture: ComponentFixture<CommonIotGatewayOverviewComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CommonIotGatewayOverviewComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CommonIotGatewayOverviewComponent);
        component = fixture.componentInstance;
        component.device = {} as Device;
        component.instrument = {} as Resource;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
