import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { GraphService } from 'common';

import { IgeModelsComponent } from './ige-models.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MaterialModule } from '../../../material.module'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('IgeModelsComponent', () => {
    let component: IgeModelsComponent;
    let fixture: ComponentFixture<IgeModelsComponent>;
    const mockGraphService = jasmine.createSpyObj(['getModels']);

    mockGraphService.getModels.and.returnValue(of([]));

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [IgeModelsComponent],
            imports: [ReactiveFormsModule, FormsModule, MaterialModule, BrowserAnimationsModule],
            providers: [
                { provide: GraphService, useValue: mockGraphService }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(IgeModelsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
