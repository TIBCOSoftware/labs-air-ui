import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StarterAppComponent } from './starter-app.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('starter-app component', () => {
    let component: StarterAppComponent;
    let fixture: ComponentFixture<StarterAppComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ StarterAppComponent ],
            imports: [ RouterTestingModule ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StarterAppComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
