import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '../../../material.module';
import { GraphService } from '../../../services/graph/graph.service';

import { IgeResourcesComponent } from './ige-resources.component';

describe('IgeResourcesComponent', () => {
  let component: IgeResourcesComponent;
  let fixture: ComponentFixture<IgeResourcesComponent>;
  const mockGraphService = jasmine.createSpyObj(['getResources']);
  const mockSnackBarService = jasmine.createSpyObj(['open']);

  mockGraphService.getResources.and.returnValue({ subscribe: () => [] });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IgeResourcesComponent ],
      providers: [
        { provide: GraphService, useValue: mockGraphService },
        { provide: MatSnackBar, useValue: mockSnackBarService }
      ],
      imports: [ HttpClientTestingModule, ReactiveFormsModule, MaterialModule, BrowserAnimationsModule],  
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IgeResourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
