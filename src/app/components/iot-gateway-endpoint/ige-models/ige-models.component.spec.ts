import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IgeModelsComponent } from './ige-models.component';

describe('IgeModelsComponent', () => {
  let component: IgeModelsComponent;
  let fixture: ComponentFixture<IgeModelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IgeModelsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IgeModelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
