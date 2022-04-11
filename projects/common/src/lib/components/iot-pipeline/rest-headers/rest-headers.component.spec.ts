import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestHeadersComponent } from './rest-headers.component';

describe('RestHeadersComponent', () => {
  let component: RestHeadersComponent;
  let fixture: ComponentFixture<RestHeadersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RestHeadersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RestHeadersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
