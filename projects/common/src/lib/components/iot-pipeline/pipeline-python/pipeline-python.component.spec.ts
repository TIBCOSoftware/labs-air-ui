import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipelinePythonComponent } from './pipeline-python.component';

describe('PipelinePythonComponent', () => {
  let component: PipelinePythonComponent;
  let fixture: ComponentFixture<PipelinePythonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PipelinePythonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PipelinePythonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
