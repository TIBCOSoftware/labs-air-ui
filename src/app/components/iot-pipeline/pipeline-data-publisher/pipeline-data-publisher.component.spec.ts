import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipelineDataPublisherComponent } from './pipeline-data-publisher.component';

describe('PipelineDataPublisherComponent', () => {
  let component: PipelineDataPublisherComponent;
  let fixture: ComponentFixture<PipelineDataPublisherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PipelineDataPublisherComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PipelineDataPublisherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
