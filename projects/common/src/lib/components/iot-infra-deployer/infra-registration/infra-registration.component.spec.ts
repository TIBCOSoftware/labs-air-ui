import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AppConfigService } from '../../../services/config/app-config.service';

import { InfraRegistrationComponent } from './infra-registration.component';

describe('InfraRegistrationComponent', () => {
    let component: InfraRegistrationComponent;
    let fixture: ComponentFixture<InfraRegistrationComponent>;
    const mockAppConfigService: Partial<AppConfigService> = jasmine.createSpyObj(['getFromConfigOrEnv', 'loadAppConfig']);

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [InfraRegistrationComponent],
            imports: [HttpClientModule, ReactiveFormsModule, MatSnackBarModule],
            providers: [
                { provide: AppConfigService, useValue: mockAppConfigService }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(InfraRegistrationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

});
