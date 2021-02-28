import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IotPipelineComponent } from './iot-pipeline.component';

describe('IotPipelineComponent', () => {
  let component: IotPipelineComponent;
  let fixture: ComponentFixture<IotPipelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IotPipelineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IotPipelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
