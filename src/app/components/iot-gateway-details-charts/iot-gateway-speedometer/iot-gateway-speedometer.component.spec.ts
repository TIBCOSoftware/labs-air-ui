import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IotGatewaySpeedometerComponent } from './iot-gateway-speedometer.component';

describe('IotGatewaySpeedometerComponent', () => {
  let component: IotGatewaySpeedometerComponent;
  let fixture: ComponentFixture<IotGatewaySpeedometerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IotGatewaySpeedometerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IotGatewaySpeedometerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
