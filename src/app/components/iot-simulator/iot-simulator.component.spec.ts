import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IotSimulatorComponent } from './iot-simulator.component';

describe('IotSimulatorComponent', () => {
  let component: IotSimulatorComponent;
  let fixture: ComponentFixture<IotSimulatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IotSimulatorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IotSimulatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
