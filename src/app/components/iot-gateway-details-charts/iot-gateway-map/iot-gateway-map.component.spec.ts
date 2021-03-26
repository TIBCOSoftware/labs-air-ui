import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IotGatewayMapComponent } from './iot-gateway-map.component';

describe('IotGatewayMapComponent', () => {
  let component: IotGatewayMapComponent;
  let fixture: ComponentFixture<IotGatewayMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IotGatewayMapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IotGatewayMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
