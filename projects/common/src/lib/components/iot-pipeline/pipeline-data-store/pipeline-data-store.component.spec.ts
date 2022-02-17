import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { of } from 'rxjs';
import { GraphService } from '../../../services/graph/graph.service';

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
        component.dataStoreForm = new FormGroup({});
        component.dataStoreForm.addControl('gateway', new FormControl(''));
        component.dataStoreForm.addControl('dataStoreId', new FormControl(''));
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
