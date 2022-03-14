import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { GraphService } from 'common';

import { IgeProtocolsComponent } from './ige-protocols.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../../material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('IgeProtocolsComponent', () => {
    let component: IgeProtocolsComponent;
    let fixture: ComponentFixture<IgeProtocolsComponent>;
    const mockGraphService = jasmine.createSpyObj(['getProtocols', 'getModels']);
    const mockSnackBarService = jasmine.createSpyObj(['open']);

    mockGraphService.getProtocols.and.returnValue(of([]));

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [IgeProtocolsComponent],
            imports: [ReactiveFormsModule, MaterialModule, BrowserAnimationsModule],
            providers: [
                { provide: GraphService, useValue: mockGraphService },
                { provide: MatSnackBar, useValue: mockSnackBarService }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(IgeProtocolsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
