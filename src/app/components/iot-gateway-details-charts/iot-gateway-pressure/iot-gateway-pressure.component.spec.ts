import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IotGatewayPressureComponent } from './iot-gateway-pressure.component';

describe('IotGatewayPressureComponent', () => {
  let component: IotGatewayPressureComponent;
  let fixture: ComponentFixture<IotGatewayPressureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IotGatewayPressureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IotGatewayPressureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
