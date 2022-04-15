import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import Axios from 'axios-observable';
import { AppConfigService } from 'common';

import { DGraphService } from './dgraph.service';

describe('DGraphService', () => {
  let service: DGraphService;

  const axios: Partial<Axios> = jasmine.createSpyObj(['xxx']);
  const appConfigService: Partial<AppConfigService> = jasmine.createSpyObj(['getFromConfigOrEnv']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, CommonModule],
      providers: [
        { provide: AppConfigService, useValue: appConfigService },
        { provide: Axios, useValue: axios }
      ]
    });
    service = TestBed.inject(DGraphService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
