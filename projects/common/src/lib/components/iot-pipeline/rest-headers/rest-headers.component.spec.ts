import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormArray, UntypedFormControl, UntypedFormGroup } from '@angular/forms';

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
    component.formData = new UntypedFormGroup({
      description: new UntypedFormControl(''),
      url: new UntypedFormControl(''),
      filters: new UntypedFormControl(''),
      logLevel: new UntypedFormControl(''),
      headers: new UntypedFormArray([])
    })
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
