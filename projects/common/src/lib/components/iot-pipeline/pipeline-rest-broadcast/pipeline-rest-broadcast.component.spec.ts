import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, FormBuilder, FormControl, FormArray } from '@angular/forms';

import { PipelineRestBroadcastComponent } from './pipeline-rest-broadcast.component';

describe('PipelineRestBroadcastComponent', () => {
  let component: PipelineRestBroadcastComponent;
  let fixture: ComponentFixture<PipelineRestBroadcastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PipelineRestBroadcastComponent ],
      providers: [ FormBuilder]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PipelineRestBroadcastComponent);
    component = fixture.componentInstance;
    component.restBroadcastForm = new FormGroup({
      logLevel: new FormControl(''),
      restTimeout: new FormControl(1),
      restURLs: new FormArray([]),
      restMethods: new FormArray([]),
      restBodies: new FormArray([]),
      endpointNames: new FormArray([])
    })
    component.models = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
