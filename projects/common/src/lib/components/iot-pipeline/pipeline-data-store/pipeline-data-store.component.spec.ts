import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { of } from 'rxjs';
import { GraphService } from '@TIBCOSoftware/labs-air-graph-client';

import { PipelineDataStoreComponent } from './pipeline-data-store.component';

describe('PipelineDataStoreComponent', () => {
    let component: PipelineDataStoreComponent;
    let fixture: ComponentFixture<PipelineDataStoreComponent>;

    const mockGraphService = jasmine.createSpyObj(['getDataStores', 'getModels']);
    mockGraphService.getDataStores.and.returnValue(of([]));


    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PipelineDataStoreComponent],
            providers: [
                { provide: GraphService, useValue: mockGraphService }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PipelineDataStoreComponent);
        component = fixture.componentInstance;
        component.dataStoreForm = new UntypedFormGroup({});
        component.dataStoreForm.addControl('gateway', new UntypedFormControl(''));
        component.dataStoreForm.addControl('dataStoreId', new UntypedFormControl(''));
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
