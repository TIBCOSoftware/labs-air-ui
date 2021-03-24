import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IotGatewayTemperatureComponent } from './iot-gateway-temperature.component';

describe('IotGatewayTemperatureComponent', () => {
  let component: IotGatewayTemperatureComponent;
  let fixture: ComponentFixture<IotGatewayTemperatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IotGatewayTemperatureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IotGatewayTemperatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
