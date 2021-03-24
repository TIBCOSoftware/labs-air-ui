import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IotGatewayHumidityComponent } from './iot-gateway-humidity.component';

describe('IotGatewayHumidityComponent', () => {
  let component: IotGatewayHumidityComponent;
  let fixture: ComponentFixture<IotGatewayHumidityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IotGatewayHumidityComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IotGatewayHumidityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
