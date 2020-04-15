import { TestBed } from '@angular/core/testing';

import { TgdbService } from './tgdb.service';

describe('TgdbService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TgdbService = TestBed.get(TgdbService);
    expect(service).toBeTruthy();
  });
});
