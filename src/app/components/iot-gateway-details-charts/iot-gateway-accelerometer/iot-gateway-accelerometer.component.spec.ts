import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IotGatewayAccelerometerComponent } from './iot-gateway-accelerometer.component';

describe('IotGatewayAccelerometerComponent', () => {
  let component: IotGatewayAccelerometerComponent;
  let fixture: ComponentFixture<IotGatewayAccelerometerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IotGatewayAccelerometerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IotGatewayAccelerometerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
