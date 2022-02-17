import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { of } from 'rxjs';
import { GraphService } from '../../../services/graph/graph.service';

import { ProtocolsComponent } from './protocols.component';

describe('ProtocolsComponent', () => {
    let component: ProtocolsComponent;
    let fixture: ComponentFixture<ProtocolsComponent>;
    const mockGraphService = jasmine.createSpyObj(['getProtocols', 'getModels']);
    mockGraphService.getProtocols.and.returnValue(of([]));

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ProtocolsComponent],
            providers: [
                { provide: GraphService, useValue: mockGraphService }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProtocolsComponent);
        component = fixture.componentInstance;
        component.transportForm = new FormGroup({});
        component.transportForm.addControl('gateway', new FormControl(''));
        component.transportForm.addControl('protocol', new FormControl(''));
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
