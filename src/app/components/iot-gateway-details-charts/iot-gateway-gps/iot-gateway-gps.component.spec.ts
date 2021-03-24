import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IotGatewayGpsComponent } from './iot-gateway-gps.component';

describe('IotGatewayGpsComponent', () => {
  let component: IotGatewayGpsComponent;
  let fixture: ComponentFixture<IotGatewayGpsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IotGatewayGpsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IotGatewayGpsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
