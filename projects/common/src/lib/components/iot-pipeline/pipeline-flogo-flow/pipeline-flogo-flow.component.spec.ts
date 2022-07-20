import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AppConfigService } from '../../../services/config/app-config.service';
import { Observable } from 'rxjs';
import { MatSelectModule } from '@angular/material/select'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';

import { PipelineFlogoFlowComponent } from './pipeline-flogo-flow.component';

describe('PipelineFlogoFlowComponent', () => {
    let component: PipelineFlogoFlowComponent;
    let fixture: ComponentFixture<PipelineFlogoFlowComponent>;
    const mockAppConfigService: Partial<AppConfigService> = jasmine.createSpyObj(['getFromConfigOrEnv']);

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PipelineFlogoFlowComponent],
            imports: [HttpClientTestingModule, MatSnackBarModule, ReactiveFormsModule, MatDialogModule, MatSelectModule, MatInputModule, 
                BrowserAnimationsModule],
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
        component.nodeChangeEvent = new Observable<any>();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
