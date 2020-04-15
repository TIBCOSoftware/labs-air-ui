import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IgeProtocolsComponent } from './ige-protocols.component';

describe('IgeProtocolsComponent', () => {
  let component: IgeProtocolsComponent;
  let fixture: ComponentFixture<IgeProtocolsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IgeProtocolsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IgeProtocolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
