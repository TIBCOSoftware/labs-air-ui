import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IotGatewayMagnetometerComponent } from './iot-gateway-magnetometer.component';

describe('IotGatewayMagnetometerComponent', () => {
  let component: IotGatewayMagnetometerComponent;
  let fixture: ComponentFixture<IotGatewayMagnetometerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IotGatewayMagnetometerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IotGatewayMagnetometerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
