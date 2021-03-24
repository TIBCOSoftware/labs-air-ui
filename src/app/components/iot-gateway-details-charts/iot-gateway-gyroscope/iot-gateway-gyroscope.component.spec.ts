import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IotGatewayGyroscopeComponent } from './iot-gateway-gyroscope.component';

describe('IotGatewayGyroscopeComponent', () => {
  let component: IotGatewayGyroscopeComponent;
  let fixture: ComponentFixture<IotGatewayGyroscopeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IotGatewayGyroscopeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IotGatewayGyroscopeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
