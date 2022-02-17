import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { EdgeService } from '../../../services/edge/edge.service';
import { GraphService } from '../../../services/graph/graph.service';
import { Gateway } from '../../../models/iot.model';

import { DataFilteringComponent } from './data-filtering.component';

describe('DataFilteringComponent', () => {
    let component: DataFilteringComponent;
    let fixture: ComponentFixture<DataFilteringComponent>;

    const mockGraphService = jasmine.createSpyObj(['getGatewayAndPipelines', 'getModels']);
    const mockEdgeService: Partial<EdgeService> = jasmine.createSpyObj(['xxx']);

    mockGraphService.getGatewayAndPipelines.and.returnValue(of([new Gateway()] as Gateway[]));

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [DataFilteringComponent],
            providers: [
                { provide: GraphService, useValue: mockGraphService },
                { provide: EdgeService, useValue: mockEdgeService }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DataFilteringComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
