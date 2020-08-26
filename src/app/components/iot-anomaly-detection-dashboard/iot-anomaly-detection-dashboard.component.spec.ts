import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IotAnomalyDetectionDashboardComponent } from './iot-anomaly-detection-dashboard.component';

describe('IotAnomalyDetectionDashboardComponent', () => {
  let component: IotAnomalyDetectionDashboardComponent;
  let fixture: ComponentFixture<IotAnomalyDetectionDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IotAnomalyDetectionDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IotAnomalyDetectionDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
