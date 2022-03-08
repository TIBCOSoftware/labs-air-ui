import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IgeResourcesComponent } from './ige-resources.component';

describe('IgeResourcesComponent', () => {
  let component: IgeResourcesComponent;
  let fixture: ComponentFixture<IgeResourcesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IgeResourcesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IgeResourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
