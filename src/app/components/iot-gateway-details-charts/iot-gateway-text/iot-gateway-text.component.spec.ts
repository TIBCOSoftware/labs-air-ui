import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IotGatewayTextComponent } from './iot-gateway-text.component';

describe('IotGatewayTextComponent', () => {
  let component: IotGatewayTextComponent;
  let fixture: ComponentFixture<IotGatewayTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IotGatewayTextComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IotGatewayTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
