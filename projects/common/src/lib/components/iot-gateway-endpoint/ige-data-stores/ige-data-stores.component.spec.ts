import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { GraphService } from 'common';

import { IgeDataStoresComponent } from './ige-data-stores.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../../material.module'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


describe('IgeDataStoresComponent', () => {
    let component: IgeDataStoresComponent;
    let fixture: ComponentFixture<IgeDataStoresComponent>;
    const mockGraphService = jasmine.createSpyObj(['getDataStores', 'getReadings', 'getRouteCenter', 'getModels']);

    mockGraphService.getDataStores.and.returnValue(of([]));

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [IgeDataStoresComponent],
            imports: [ReactiveFormsModule, FormsModule, MaterialModule, BrowserAnimationsModule],
            providers: [
                { provide: GraphService, useValue: mockGraphService }
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
