import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipelineDataSourceComponent } from './pipeline-data-source.component';

describe('PipelineDataSourceComponent', () => {
  let component: PipelineDataSourceComponent;
  let fixture: ComponentFixture<PipelineDataSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PipelineDataSourceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PipelineDataSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
