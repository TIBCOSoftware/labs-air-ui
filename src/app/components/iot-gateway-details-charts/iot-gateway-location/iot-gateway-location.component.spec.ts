import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IotGatewayLocationComponent } from './iot-gateway-location.component';

describe('IotGatewayLocationComponent', () => {
  let component: IotGatewayLocationComponent;
  let fixture: ComponentFixture<IotGatewayLocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IotGatewayLocationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IotGatewayLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
