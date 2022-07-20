import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormArray, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GraphService } from '@TIBCOSoftware/labs-air-graph-client';
import { Observable } from 'rxjs';

import { PipelinePythonPipeComponent } from './pipeline-python-pipe.component';

describe('PipelinePythonPipeComponent', () => {
  let component: PipelinePythonPipeComponent;
  let fixture: ComponentFixture<PipelinePythonPipeComponent>;
  const mockGraphService = jasmine.createSpyObj(['getPythonResources']);
  mockGraphService.getPythonResources.and.returnValue({ subscribe: () => [] });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PipelinePythonPipeComponent],
      providers: [
        { provide: GraphService, useValue: mockGraphService }
      ],
      imports: [ReactiveFormsModule, MatSelectModule, MatInputModule, BrowserAnimationsModule]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PipelinePythonPipeComponent);
    component = fixture.componentInstance;
    component.pythonInputs = [];
    component.nodeChangeEvent = new Observable<any>();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
