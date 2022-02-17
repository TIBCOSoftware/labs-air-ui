import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AppConfigService } from '../../../services/config/app-config.service';

import { PipelineFlogoFlowComponent } from './pipeline-flogo-flow.component';

describe('PipelineFlogoFlowComponent', () => {
    let component: PipelineFlogoFlowComponent;
    let fixture: ComponentFixture<PipelineFlogoFlowComponent>;
    const mockAppConfigService: Partial<AppConfigService> = jasmine.createSpyObj(['getFromConfigOrEnv']);

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PipelineFlogoFlowComponent],
            imports: [HttpClientTestingModule, MatSnackBarModule, ReactiveFormsModule, MatDialogModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: AppConfigService, useValue: mockAppConfigService }
            ],
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PipelineFlogoFlowComponent);
        component = fixture.componentInstance;
        component.flogoFlowForm = new FormGroup({});
        component.flogoFlowForm.addControl('flowProperties', new FormControl(''));
        component.flogoFlowForm.addControl('httpServicePort', new FormControl(''));
        component.flogoFlowForm.addControl('flowFilename', new FormControl(''));
        component.flogoFlowForm.addControl('flowDefinition', new FormControl(''));
        component.flogoFlowForm.addControl('volumeName', new FormControl(''));
        component.flogoFlowForm.addControl('volumePath', new FormControl(''));
        component.flogoFlowForm.addControl('portMap1', new FormControl(''));
        component.flogoFlowForm.addControl('portMap2', new FormControl(''));
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
