import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GraphService } from '../../../services/graph/graph.service';

import { PipelinePythonComponent } from './pipeline-python.component';

describe('PipelinePythonComponent', () => {
  let component: PipelinePythonComponent;
  let fixture: ComponentFixture<PipelinePythonComponent>;
  const mockGraphService = jasmine.createSpyObj(['getResources']);
  mockGraphService.getResources.and.returnValue({ subscribe: () => [] });


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PipelinePythonComponent ],
      providers: [
        { provide: GraphService, useValue: mockGraphService }
      ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PipelinePythonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
