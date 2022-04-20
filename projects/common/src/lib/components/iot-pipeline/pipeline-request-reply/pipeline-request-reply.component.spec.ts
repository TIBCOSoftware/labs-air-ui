import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GraphService } from '@TIBCOSoftware/labs-air-graph-client';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { PipelineRequestReplyComponent } from './pipeline-request-reply.component';
import { FormControl, FormGroup } from '@angular/forms';
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('PipelineRequestReplyComponent', () => {
  let component: PipelineRequestReplyComponent;
  let fixture: ComponentFixture<PipelineRequestReplyComponent>;
  const mockGraphService = jasmine.createSpyObj(['getProtocols']);

  mockGraphService.getProtocols.and.returnValue(of([]));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PipelineRequestReplyComponent ],
      imports: [HttpClientTestingModule],
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
    component.requestReplyForm = new FormGroup({
      gateway: new FormControl('')
    })
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
