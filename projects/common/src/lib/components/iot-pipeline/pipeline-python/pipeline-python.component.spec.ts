import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GraphService } from '@TIBCOSoftware/labs-air-graph-client';
import { Observable } from 'rxjs';

import { PipelinePythonComponent } from './pipeline-python.component';

describe('PipelinePythonComponent', () => {
  let component: PipelinePythonComponent;
  let fixture: ComponentFixture<PipelinePythonComponent>;
  const mockGraphService = jasmine.createSpyObj(['getPythonResources']);
  mockGraphService.getPythonResources.and.returnValue({ subscribe: () => [] });


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PipelinePythonComponent ],
      providers: [
        { provide: GraphService, useValue: mockGraphService }
      ],
      imports: [ReactiveFormsModule, MatSelectModule, MatInputModule, BrowserAnimationsModule]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PipelinePythonComponent);
    component = fixture.componentInstance;
    component.nodeChangeEvent = new Observable<any>();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
