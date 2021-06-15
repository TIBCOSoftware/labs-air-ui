import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IotGatewayTimeSeriesComponent } from './iot-gateway-time-series.component';

describe('IotGatewayTimeSeriesComponent', () => {
  let component: IotGatewayTimeSeriesComponent;
  let fixture: ComponentFixture<IotGatewayTimeSeriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IotGatewayTimeSeriesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IotGatewayTimeSeriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
