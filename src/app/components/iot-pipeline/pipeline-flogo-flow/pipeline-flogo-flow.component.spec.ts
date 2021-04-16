import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipelineFlogoFlowComponent } from './pipeline-flogo-flow.component';

describe('PipelineFlogoFlowComponent', () => {
  let component: PipelineFlogoFlowComponent;
  let fixture: ComponentFixture<PipelineFlogoFlowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PipelineFlogoFlowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PipelineFlogoFlowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
