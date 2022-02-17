import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AppConfigService } from '../../../services/config/app-config.service';
import { GraphService } from '../../../services/graph/graph.service';

import { FilteringComponent } from './filtering.component';

describe('FilteringComponent', () => {
    let component: FilteringComponent;
    let fixture: ComponentFixture<FilteringComponent>;

    const mockAppConfigService: Partial<AppConfigService> = jasmine.createSpyObj(['getFromConfigOrEnv']);
    const mockGraphService: Partial<GraphService> = jasmine.createSpyObj(['getModels']);

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [FilteringComponent],
            imports: [HttpClientTestingModule, MatSnackBarModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: AppConfigService, useValue: mockAppConfigService },
                { provide: GraphService, useValue: mockGraphService }
            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FilteringComponent);
        component = fixture.componentInstance;
        component.devices = [];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
