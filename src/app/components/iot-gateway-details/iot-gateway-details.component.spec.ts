import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IotGatewayDetailsComponent } from './iot-gateway-details.component';

describe('IotGatewayDetailsComponent', () => {
  let component: IotGatewayDetailsComponent;
  let fixture: ComponentFixture<IotGatewayDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IotGatewayDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IotGatewayDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
