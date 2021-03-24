import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IotGatewayProximityComponent } from './iot-gateway-proximity.component';

describe('IotGatewayProximityComponent', () => {
  let component: IotGatewayProximityComponent;
  let fixture: ComponentFixture<IotGatewayProximityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IotGatewayProximityComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IotGatewayProximityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
