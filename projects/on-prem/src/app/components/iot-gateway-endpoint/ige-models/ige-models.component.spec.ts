import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AppModule } from '../../../app.module';
import { GraphService } from '../../../services/graph/graph.service';

import { IgeModelsComponent } from './ige-models.component';

describe('IgeModelsComponent', () => {
    let component: IgeModelsComponent;
    let fixture: ComponentFixture<IgeModelsComponent>;
    const mockGraphService = jasmine.createSpyObj(['getModels']);

    mockGraphService.getModels.and.returnValue(of([]));

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [IgeModelsComponent],
            imports: [AppModule],
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
