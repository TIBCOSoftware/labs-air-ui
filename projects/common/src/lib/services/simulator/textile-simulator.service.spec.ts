import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AppConfigService } from '../config/app-config.service';

import { TextileSimulatorService } from './textile-simulator.service';

describe('TextileSimulatorService', () => {
    let service: TextileSimulatorService;
    const mockAppConfigService: Partial<AppConfigService> = jasmine.createSpyObj(['getFromConfigOrEnv']);

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                { provide: AppConfigService, useValue: mockAppConfigService }
            ]
        });
        service = TestBed.inject(TextileSimulatorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
