import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipelineRestBroadcastComponent } from './pipeline-rest-broadcast.component';

describe('PipelineRestBroadcastComponent', () => {
  let component: PipelineRestBroadcastComponent;
  let fixture: ComponentFixture<PipelineRestBroadcastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PipelineRestBroadcastComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PipelineRestBroadcastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
