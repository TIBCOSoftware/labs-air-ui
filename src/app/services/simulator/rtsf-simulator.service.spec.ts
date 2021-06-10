import { TestBed } from '@angular/core/testing';

import { RtsfSimulatorService } from './rtsf-simulator.service';

describe('RtsfSimulatorService', () => {
  let service: RtsfSimulatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RtsfSimulatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
