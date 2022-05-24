import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
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
    component.pythonPipeForm = new FormGroup({
      name: new FormControl(''),
      logLevel: new FormControl('INFO'),
      fileContent: new FormControl(''),
      context: new FormGroup({
        name: new FormControl(''),
        data: new FormGroup({
          input: new FormGroup({}),
          output: new FormArray([]),
          dependsOn: new FormArray([]),
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
