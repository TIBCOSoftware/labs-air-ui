import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IotGatewayEndpointComponent } from './iot-gateway-endpoint.component';

describe('IotGatewayEndpointComponent', () => {
  let component: IotGatewayEndpointComponent;
  let fixture: ComponentFixture<IotGatewayEndpointComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IotGatewayEndpointComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IotGatewayEndpointComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
