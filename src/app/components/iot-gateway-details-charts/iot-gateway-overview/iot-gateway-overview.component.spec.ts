import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IotGatewayOverviewComponent } from './iot-gateway-overview.component';

describe('IotGatewayOverviewComponent', () => {
  let component: IotGatewayOverviewComponent;
  let fixture: ComponentFixture<IotGatewayOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IotGatewayOverviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IotGatewayOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
