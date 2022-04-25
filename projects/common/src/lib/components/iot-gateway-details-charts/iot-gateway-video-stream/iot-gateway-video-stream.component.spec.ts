import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { EdgeService } from '../../../services/edge/edge.service';
import { GraphService } from '../../../services/graph/graph.service';
import { Device, Resource } from '../../../models/iot.model';

import { CommonIotGatewayVideoStreamComponent } from './iot-gateway-video-stream.component';

describe('CommonIotGatewayVideoStreamComponent', () => {
    let component: CommonIotGatewayVideoStreamComponent;
    let fixture: ComponentFixture<CommonIotGatewayVideoStreamComponent>;
    const mockGraphService = jasmine.createSpyObj(['getReadings', 'getModels']);
    const mockEdgeService: Partial<EdgeService> = jasmine.createSpyObj(['xxx']);

    mockGraphService.getReadings.and.returnValue(of([]));

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CommonIotGatewayVideoStreamComponent],
            providers: [
                { provide: GraphService, useValue: mockGraphService },
                { provide: EdgeService, useValue: mockEdgeService }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CommonIotGatewayVideoStreamComponent);
        component = fixture.componentInstance;
        component.device = { name: '' } as Device;
        component.instrument = {} as Resource;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
