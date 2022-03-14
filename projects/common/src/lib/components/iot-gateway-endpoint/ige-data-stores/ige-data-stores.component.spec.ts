import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { GraphService } from 'common';
import { IgeDataStoresComponent } from './ige-data-stores.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../../material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('IgeDataStoresComponent', () => {
    let component: IgeDataStoresComponent;
    let fixture: ComponentFixture<IgeDataStoresComponent>;
    const mockGraphService = jasmine.createSpyObj(['getDataStores', 'getReadings', 'getRouteCenter', 'getModels']);
    const mockSnackBarService = jasmine.createSpyObj(['open']);

    mockGraphService.getDataStores.and.returnValue(of([]));

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [IgeDataStoresComponent],
            imports: [ReactiveFormsModule, MaterialModule, BrowserAnimationsModule],
            providers: [
                { provide: GraphService, useValue: mockGraphService },
                { provide: MatSnackBar, useValue: mockSnackBarService }
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
