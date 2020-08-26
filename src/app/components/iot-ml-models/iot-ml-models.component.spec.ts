import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IotMlModelsComponent } from './iot-ml-models.component';

describe('IotMlModelsComponent', () => {
  let component: IotMlModelsComponent;
  let fixture: ComponentFixture<IotMlModelsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IotMlModelsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IotMlModelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
