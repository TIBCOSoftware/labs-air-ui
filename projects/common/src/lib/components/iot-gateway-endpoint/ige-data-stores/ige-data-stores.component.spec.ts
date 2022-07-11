import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { GraphService } from '@TIBCOSoftware/labs-air-graph-client';

import { IgeDataStoresComponent } from './ige-data-stores.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { UntypedFormBuilder } from '@angular/forms';

describe('IgeDataStoresComponent', () => {
    let component: IgeDataStoresComponent;
    let fixture: ComponentFixture<IgeDataStoresComponent>;
    const mockGraphService = jasmine.createSpyObj(['getDataStores', 'getReadings', 'getRouteCenter', 'getModels']);
    const mockSnackBarService = jasmine.createSpyObj(['open']);

    mockGraphService.getDataStores.and.returnValue(of([]));

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [IgeDataStoresComponent],
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
        fixture = TestBed.createComponent(IgeDataStoresComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
