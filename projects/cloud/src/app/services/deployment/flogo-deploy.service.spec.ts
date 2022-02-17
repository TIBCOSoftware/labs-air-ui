import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AppConfigService } from '../config/app-config.service';
import { GraphService } from '../graph/graph.service';

import { FlogoDeployService } from './flogo-deploy.service';

describe('FlogoDeployService', () => {
    const mockAppConfigService: Partial<AppConfigService> = jasmine.createSpyObj(['getFromConfigOrEnv']);
    const mockGraphService = jasmine.createSpyObj(['getGateway', 'getModels']);

    beforeEach(() => TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
            { provide: AppConfigService, useValue: mockAppConfigService },
            { provide: GraphService, useValue: mockGraphService }
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }));

    it('should be created', () => {
        const service: FlogoDeployService = TestBed.inject(FlogoDeployService);
        expect(service).toBeTruthy();
    });

    //expect registration to be success
});
