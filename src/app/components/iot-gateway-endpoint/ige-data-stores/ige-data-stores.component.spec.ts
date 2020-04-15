import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IgeDataStoresComponent } from './ige-data-stores.component';

describe('IgeDataStoresComponent', () => {
  let component: IgeDataStoresComponent;
  let fixture: ComponentFixture<IgeDataStoresComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IgeDataStoresComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IgeDataStoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
