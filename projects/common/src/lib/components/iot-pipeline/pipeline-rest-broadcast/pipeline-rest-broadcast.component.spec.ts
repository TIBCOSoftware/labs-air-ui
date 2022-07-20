import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, UntypedFormArray } from '@angular/forms';
import { Observable } from 'rxjs';

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
    component.models = [];
    component.nodeChangeEvent = new Observable<any>();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
