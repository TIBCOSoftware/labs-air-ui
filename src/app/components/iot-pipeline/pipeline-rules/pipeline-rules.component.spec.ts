import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipelineRulesComponent } from './pipeline-rules.component';

describe('PipelineRulesComponent', () => {
  let component: PipelineRulesComponent;
  let fixture: ComponentFixture<PipelineRulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PipelineRulesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PipelineRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
