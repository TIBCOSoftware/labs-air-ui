import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormArray, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { GraphService } from '@TIBCOSoftware/labs-air-graph-client';

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
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PipelinePythonPipeComponent);
    component = fixture.componentInstance;
    component.pythonInputs = [];
    component.pythonPipeForm = new UntypedFormGroup({
      name: new UntypedFormControl(''),
      logLevel: new UntypedFormControl('INFO'),
      fileContent: new UntypedFormControl(''),
      context: new UntypedFormGroup({
        name: new UntypedFormControl(''),
        data: new UntypedFormGroup({
          input: new UntypedFormGroup({}),
          output: new UntypedFormArray([]),
          dependsOn: new UntypedFormArray([]),
        }),
      })
    })
    component.subscription = component.pythonPipeForm.controls['name'].valueChanges.subscribe();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
