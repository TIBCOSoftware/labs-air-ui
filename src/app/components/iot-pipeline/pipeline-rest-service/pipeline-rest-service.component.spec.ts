import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipelineRestServiceComponent } from './pipeline-rest-service.component';

describe('PipelineRestServiceComponent', () => {
  let component: PipelineRestServiceComponent;
  let fixture: ComponentFixture<PipelineRestServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PipelineRestServiceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PipelineRestServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
