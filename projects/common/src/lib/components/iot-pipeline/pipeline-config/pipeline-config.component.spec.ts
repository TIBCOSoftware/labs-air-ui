import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipelineConfigComponent } from './pipeline-config.component';

describe('PipelineConfigComponent', () => {
    let component: PipelineConfigComponent;
    let fixture: ComponentFixture<PipelineConfigComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PipelineConfigComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PipelineConfigComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
