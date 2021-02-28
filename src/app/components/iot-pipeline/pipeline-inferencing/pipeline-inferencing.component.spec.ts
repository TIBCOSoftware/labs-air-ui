import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipelineInferencingComponent } from './pipeline-inferencing.component';

describe('PipelineInferencingComponent', () => {
  let component: PipelineInferencingComponent;
  let fixture: ComponentFixture<PipelineInferencingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PipelineInferencingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PipelineInferencingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
