import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodePrimaryComponent } from './node-primary.component';

describe('NodePrimaryComponent', () => {
  let component: NodePrimaryComponent;
  let fixture: ComponentFixture<NodePrimaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NodePrimaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NodePrimaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
