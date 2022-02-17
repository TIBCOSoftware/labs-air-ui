import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { GraphService } from '../../services/graph/graph.service';
import { Gateway } from '../../models/iot.model';

import { CommonIotInfraDeployerComponent } from './iot-infra-deployer.component';

describe('COmmonIotInfraDeployerComponent', () => {
    let component: CommonIotInfraDeployerComponent;
    let fixture: ComponentFixture<CommonIotInfraDeployerComponent>;
    const mockGraphService = jasmine.createSpyObj(['getGateways', 'getGatewayAndPipelines', 'getModels']);

    mockGraphService.getGateways.and.returnValue(of([]));
    mockGraphService.getGatewayAndPipelines.and.returnValue(of([new Gateway()] as Gateway[]));

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CommonIotInfraDeployerComponent],
            imports: [RouterTestingModule],
            providers: [
                { provide: GraphService, useValue: mockGraphService }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CommonIotInfraDeployerComponent);
        component = fixture.componentInstance;
        component.deployerForm = new FormGroup({});
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
