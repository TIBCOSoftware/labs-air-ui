import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IotEdgeDataPipelineComponent } from './iot-edge-data-pipeline.component';

describe('IotEdgeDataPipelineComponent', () => {
  let component: IotEdgeDataPipelineComponent;
  let fixture: ComponentFixture<IotEdgeDataPipelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IotEdgeDataPipelineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IotEdgeDataPipelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
