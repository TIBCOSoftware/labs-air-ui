import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipelineRuleExpressionComponent } from './pipeline-rule-expression.component';

describe('PipelineRuleExpressionComponent', () => {
  let component: PipelineRuleExpressionComponent;
  let fixture: ComponentFixture<PipelineRuleExpressionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PipelineRuleExpressionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PipelineRuleExpressionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
