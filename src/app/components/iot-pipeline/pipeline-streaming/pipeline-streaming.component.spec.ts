import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipelineStreamingComponent } from './pipeline-streaming.component';

describe('PipelineStreamingComponent', () => {
  let component: PipelineStreamingComponent;
  let fixture: ComponentFixture<PipelineStreamingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PipelineStreamingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PipelineStreamingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
