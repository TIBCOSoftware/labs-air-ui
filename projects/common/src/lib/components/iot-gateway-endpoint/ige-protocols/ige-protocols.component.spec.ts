import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { GraphService } from '@TIBCOSoftware/labs-air-graph-client';

import { IgeProtocolsComponent } from './ige-protocols.component';
import { UntypedFormBuilder } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('IgeProtocolsComponent', () => {
    let component: IgeProtocolsComponent;
    let fixture: ComponentFixture<IgeProtocolsComponent>;
    const mockGraphService = jasmine.createSpyObj(['getProtocols', 'getModels']);

    mockGraphService.getProtocols.and.returnValue(of([]));

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [IgeProtocolsComponent],
            imports: [MatSnackBarModule],
            providers: [
                { provide: GraphService, useValue: mockGraphService },
                UntypedFormBuilder
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(IgeProtocolsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
