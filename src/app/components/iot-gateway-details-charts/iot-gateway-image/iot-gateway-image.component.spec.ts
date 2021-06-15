import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IotGatewayImageComponent } from './iot-gateway-image.component';

describe('IotGatewayImageComponent', () => {
  let component: IotGatewayImageComponent;
  let fixture: ComponentFixture<IotGatewayImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IotGatewayImageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IotGatewayImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
