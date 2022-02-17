import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AppConfigService } from '../config/app-config.service';
import { GraphService } from '../graph/graph.service';

import { RtsfSimulatorService } from './rtsf-simulator.service';

describe('RtsfSimulatorService', () => {
    let service: RtsfSimulatorService;
    const mockGraphService = jasmine.createSpyObj(['getGateway', 'getModels']);
    const mockAppConfigService: Partial<AppConfigService> = jasmine.createSpyObj(['getFromConfigOrEnv']);

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                { provide: AppConfigService, useValue: mockAppConfigService },
                { provide: GraphService, useValue: mockGraphService }
            ]
        });
        service = TestBed.inject(RtsfSimulatorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
