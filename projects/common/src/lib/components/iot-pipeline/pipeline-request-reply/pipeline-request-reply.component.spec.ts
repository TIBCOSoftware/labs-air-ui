import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipelineRequestReplyComponent } from './pipeline-request-reply.component';

describe('PipelineRequestReplyComponent', () => {
  let component: PipelineRequestReplyComponent;
  let fixture: ComponentFixture<PipelineRequestReplyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PipelineRequestReplyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PipelineRequestReplyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
