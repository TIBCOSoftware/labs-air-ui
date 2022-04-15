import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { GraphService } from '@TIBCOSoftware/labs-air-graph-client';

import { IgeDataStoresComponent } from './ige-data-stores.component';
import { FormBuilder } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('IgeDataStoresComponent', () => {
    let component: IgeDataStoresComponent;
    let fixture: ComponentFixture<IgeDataStoresComponent>;
    const mockGraphService = jasmine.createSpyObj(['getDataStores', 'getReadings', 'getRouteCenter', 'getModels']);

    mockGraphService.getDataStores.and.returnValue(of([]));

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [IgeDataStoresComponent],
            imports: [MatSnackBarModule],
            providers: [
                { provide: GraphService, useValue: mockGraphService },
                FormBuilder
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(IgeDataStoresComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
