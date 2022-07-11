import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppConfigService } from '../../../services/config/app-config.service';
import { EdgeService } from '../../../services/edge/edge.service';
import { InfraDeployerComponent } from './infra-deployer.component';
import { UntypedFormBuilder } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('InfraDeployerComponent', () => {
    let component: InfraDeployerComponent;
    let fixture: ComponentFixture<InfraDeployerComponent>;

    const mockAppConfigService: Partial<AppConfigService> = jasmine.createSpyObj(['getFromConfigOrEnv', 'loadAppConfig']);
    const mockEdgeService: Partial<EdgeService> = jasmine.createSpyObj(['getDevices']);
    const appConfigService: Partial<AppConfigService> = jasmine.createSpyObj(['getFromConfigOrEnv']);

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [InfraDeployerComponent],
            imports: [HttpClientTestingModule, MatSnackBarModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: AppConfigService, useValue: appConfigService },
                UntypedFormBuilder
            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(InfraDeployerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create it', () => {
        expect(component).toBeTruthy();
    });
});
