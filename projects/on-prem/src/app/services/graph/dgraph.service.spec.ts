import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AppConfigService } from 'common';

import { DGraphService } from './dgraph.service';

describe('DGraphService', () => {
  let service: DGraphService;

  const httpClient: Partial<HttpClient> = jasmine.createSpyObj(['xxx']);
  const appConfigService: Partial<AppConfigService> = jasmine.createSpyObj(['getFromConfigOrEnv']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, CommonModule],
      providers: [
        { provide: AppConfigService, useValue: appConfigService },
        { provide: HttpClient, useValue: httpClient }
      ]
    });
    service = TestBed.inject(DGraphService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
