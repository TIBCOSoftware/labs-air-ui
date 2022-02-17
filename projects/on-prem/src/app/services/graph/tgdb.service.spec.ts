import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';

import { TgdbService } from './tgdb.service';

describe('TgdbService', () => {
    let service: TgdbService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                RouterModule.forRoot([])
            ], providers: [
                TgdbService
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });
        service = TestBed.inject(TgdbService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
