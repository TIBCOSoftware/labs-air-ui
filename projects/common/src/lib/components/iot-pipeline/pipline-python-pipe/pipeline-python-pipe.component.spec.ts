import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipelinePythonPipeComponent } from './pipeline-python-pipe.component';

describe('PipelinePythonPipeComponent', () => {
  let component: PipelinePythonPipeComponent;
  let fixture: ComponentFixture<PipelinePythonPipeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PipelinePythonPipeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PipelinePythonPipeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
