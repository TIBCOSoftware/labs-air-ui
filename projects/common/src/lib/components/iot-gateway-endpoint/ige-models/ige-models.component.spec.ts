import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { GraphService } from '@TIBCOSoftware/labs-air-graph-client';

import { IgeModelsComponent } from './ige-models.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { UntypedFormBuilder } from '@angular/forms';

describe('IgeModelsComponent', () => {
    let component: IgeModelsComponent;
    let fixture: ComponentFixture<IgeModelsComponent>;
    const mockGraphService = jasmine.createSpyObj(['getRestEndpoints']);

    mockGraphService.getModels.and.returnValue(of([]));

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [IgeModelsComponent],
            imports: [MatSnackBarModule],
            providers: [
                { provide: GraphService, useValue: mockGraphService },
                UntypedFormBuilder
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
