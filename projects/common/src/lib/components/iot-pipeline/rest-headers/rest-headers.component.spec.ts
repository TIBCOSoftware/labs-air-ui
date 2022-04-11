import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormControl, FormGroup } from '@angular/forms';

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
    component.restForm = new FormGroup({
      description: new FormControl(''),
      url: new FormControl(''),
      filters: new FormControl(''),
      logLevel: new FormControl(''),
      headers: new FormArray([])
    })
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
