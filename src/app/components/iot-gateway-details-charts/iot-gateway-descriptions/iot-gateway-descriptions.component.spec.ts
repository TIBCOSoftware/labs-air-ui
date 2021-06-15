import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IotGatewayDescriptionsComponent } from './iot-gateway-descriptions.component';

describe('IotGatewayDescriptionsComponent', () => {
  let component: IotGatewayDescriptionsComponent;
  let fixture: ComponentFixture<IotGatewayDescriptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IotGatewayDescriptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IotGatewayDescriptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
