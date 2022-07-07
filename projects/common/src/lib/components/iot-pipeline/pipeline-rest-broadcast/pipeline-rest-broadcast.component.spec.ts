import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, UntypedFormArray } from '@angular/forms';

import { PipelineRestBroadcastComponent } from './pipeline-rest-broadcast.component';

describe('PipelineRestBroadcastComponent', () => {
  let component: PipelineRestBroadcastComponent;
  let fixture: ComponentFixture<PipelineRestBroadcastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PipelineRestBroadcastComponent ],
      providers: [ UntypedFormBuilder]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PipelineRestBroadcastComponent);
    component = fixture.componentInstance;
    component.restBroadcastForm = new UntypedFormGroup({
      logLevel: new UntypedFormControl(''),
      restTimeout: new UntypedFormControl(1),
      restURLs: new UntypedFormArray([]),
      restMethods: new UntypedFormArray([]),
      restBodies: new UntypedFormArray([]),
      endpointNames: new UntypedFormArray([])
    })
    component.models = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
