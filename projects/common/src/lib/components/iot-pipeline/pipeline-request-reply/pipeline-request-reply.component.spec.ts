import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GraphService } from '@TIBCOSoftware/labs-air-graph-client';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { PipelineRequestReplyComponent } from './pipeline-request-reply.component';
import { ReactiveFormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('PipelineRequestReplyComponent', () => {
  let component: PipelineRequestReplyComponent;
  let fixture: ComponentFixture<PipelineRequestReplyComponent>;
  const mockGraphService = jasmine.createSpyObj(['getProtocols']);

  mockGraphService.getProtocols.and.returnValue(of([]));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PipelineRequestReplyComponent ],
      imports: [HttpClientTestingModule, ReactiveFormsModule, MatSelectModule, MatInputModule, BrowserAnimationsModule],
      providers: [
        { provide: GraphService, useValue: mockGraphService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]

    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PipelineRequestReplyComponent);
    component = fixture.componentInstance;
    component.nodeChangeEvent = new Observable<any>();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
