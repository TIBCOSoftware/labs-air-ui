import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InferencingComponent } from './inferencing.component';

describe('InferencingComponent', () => {
  let component: InferencingComponent;
  let fixture: ComponentFixture<InferencingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InferencingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InferencingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
