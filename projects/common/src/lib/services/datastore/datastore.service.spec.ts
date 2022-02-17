import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { DatastoreService } from './datastore.service';

describe('DatastoreService', () => {
    beforeEach(() => TestBed.configureTestingModule({
        imports: [HttpClientTestingModule]
    }));

    it('should be created', () => {
        const service: DatastoreService = TestBed.inject(DatastoreService);
        expect(service).toBeTruthy();
    });
});
