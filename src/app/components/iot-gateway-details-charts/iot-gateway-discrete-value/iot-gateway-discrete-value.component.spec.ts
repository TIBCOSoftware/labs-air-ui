import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IotGatewayDiscreteValueComponent } from './iot-gateway-discrete-value.component';

describe('IotGatewayDiscreteValueComponent', () => {
  let component: IotGatewayDiscreteValueComponent;
  let fixture: ComponentFixture<IotGatewayDiscreteValueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IotGatewayDiscreteValueComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IotGatewayDiscreteValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
