import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { GraphService } from '../../../services/graph/graph.service';

import { ProtocolsViewComponent } from './protocols-view.component';

describe('CommonProtocolsViewComponent', () => {
    let component: ProtocolsViewComponent;
    let fixture: ComponentFixture<ProtocolsViewComponent>;
    const mockGraphService: Partial<GraphService> = jasmine.createSpyObj(['getGateways', 'getGatewayAndPipelines', 'getModels']);

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ProtocolsViewComponent],
            providers: [
                { provide: GraphService, useValue: mockGraphService }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProtocolsViewComponent);
        component = fixture.componentInstance;
        component.transportForm = new FormGroup({});
        component.transportForm.addControl('gateway', new FormControl(''));
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
