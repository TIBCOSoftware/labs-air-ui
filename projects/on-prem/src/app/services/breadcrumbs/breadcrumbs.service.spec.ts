import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { Gateway } from '../../shared/models/iot.model';
import { GraphService } from '../graph/graph.service';

import { BreadcrumbsService } from './breadcrumbs.service';

describe('BreadcrumbsService', () => {
    let service: BreadcrumbsService;
    const mockGraphService = jasmine.createSpyObj(['getGateways', 'getGatewayAndPipelines', 'getModels']);

    mockGraphService.getGateways.and.returnValue(of([]));
    mockGraphService.getGatewayAndPipelines.and.returnValue(of([new Gateway()] as Gateway[]));

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            providers: [
                { provide: GraphService, useValue: mockGraphService }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });
        service = TestBed.inject(BreadcrumbsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
