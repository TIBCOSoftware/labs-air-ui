import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipelineFilteringComponent } from './pipeline-filtering.component';

describe('PipelineFilteringComponent', () => {
  let component: PipelineFilteringComponent;
  let fixture: ComponentFixture<PipelineFilteringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PipelineFilteringComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PipelineFilteringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
