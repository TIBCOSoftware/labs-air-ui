import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { GraphService } from './graph.service';

describe('GraphService', () => {
    const mockGraphService: Partial<GraphService> = jasmine.createSpyObj(['getReadings', 'getModels']);

    beforeEach(() => TestBed.configureTestingModule({
        providers: [
            { provide: GraphService, useValue: mockGraphService }
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }));

    it('should be created', () => {
        const service: GraphService = TestBed.get(GraphService);
        expect(service).toBeTruthy();
    });
});
