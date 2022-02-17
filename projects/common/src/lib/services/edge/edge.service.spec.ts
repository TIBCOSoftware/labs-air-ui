import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AppConfigService } from '../config/app-config.service';

import { EdgeService } from './edge.service';

describe('EdgeService', () => {
    const mockAppConfigService: Partial<AppConfigService> = jasmine.createSpyObj(['getFromConfigOrEnv']);

    beforeEach(() => TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
            { provide: AppConfigService, useValue: mockAppConfigService }
        ]
    }));

    it('should be created', () => {
        const service: EdgeService = TestBed.inject(EdgeService);
        expect(service).toBeTruthy();
    });
});
