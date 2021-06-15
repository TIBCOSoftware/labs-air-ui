import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IotGatewayXyzValueComponent } from './iot-gateway-xyz-value.component';

describe('IotGatewayXyzValueComponent', () => {
  let component: IotGatewayXyzValueComponent;
  let fixture: ComponentFixture<IotGatewayXyzValueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IotGatewayXyzValueComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IotGatewayXyzValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
