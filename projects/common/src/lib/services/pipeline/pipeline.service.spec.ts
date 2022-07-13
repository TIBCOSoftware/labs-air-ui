import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { GraphService } from '@TIBCOSoftware/labs-air-graph-client';
import { AppConfigService } from '../config/app-config.service';

import { PipelineService } from './pipeline.service';

describe('PipelineService', () => {
  let service: PipelineService;
  const mockGraphService: Partial <GraphService> = jasmine.createSpyObj(['']);
  const mockAppConfigService: Partial<AppConfigService> = jasmine.createSpyObj(['getFromConfigOrEnv']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MatSnackBarModule],
      providers: [ { provide: GraphService, useValue: mockGraphService },
                   { provide: AppConfigService, useValue: mockAppConfigService}
                 ],
        
    });
    service = TestBed.inject(PipelineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
