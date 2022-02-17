import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { of } from 'rxjs';
import { GraphService } from '../../../services/graph/graph.service';

import { DataStoresComponent } from './data-stores.component';

describe('DataStoresComponent', () => {
    let component: DataStoresComponent;
    let fixture: ComponentFixture<DataStoresComponent>;
    const mockGraphService = jasmine.createSpyObj(['getDataStores', 'getReadings', 'getModels']);
    mockGraphService.getDataStores.and.returnValue(of([]));

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [DataStoresComponent],
            providers: [
                { provide: GraphService, useValue: mockGraphService }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DataStoresComponent);
        component = fixture.componentInstance;
        component.dataStoreForm = new FormGroup({});
        component.dataStoreForm.addControl('gateway', new FormControl(''));
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
