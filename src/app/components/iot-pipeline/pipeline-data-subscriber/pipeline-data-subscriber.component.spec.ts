import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipelineDataSubscriberComponent } from './pipeline-data-subscriber.component';

describe('PipelineDataSubscriberComponent', () => {
  let component: PipelineDataSubscriberComponent;
  let fixture: ComponentFixture<PipelineDataSubscriberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PipelineDataSubscriberComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PipelineDataSubscriberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
