import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipelineDataStoreComponent } from './pipeline-data-store.component';

describe('PipelineDataStoreComponent', () => {
  let component: PipelineDataStoreComponent;
  let fixture: ComponentFixture<PipelineDataStoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PipelineDataStoreComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PipelineDataStoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
