import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipelineDataPipeComponent } from './pipeline-data-pipe.component';

describe('PipelineDataPipeComponent', () => {
  let component: PipelineDataPipeComponent;
  let fixture: ComponentFixture<PipelineDataPipeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PipelineDataPipeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PipelineDataPipeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
