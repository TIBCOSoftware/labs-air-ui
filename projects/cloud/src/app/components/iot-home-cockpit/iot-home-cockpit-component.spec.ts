import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { IotHomeCockpitComponent } from './iot-home-cockpit.component';

describe('iot-home-cockpitComponent', () => {
    let component: IotHomeCockpitComponent;
    let fixture: ComponentFixture<IotHomeCockpitComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [IotHomeCockpitComponent],
            imports: [RouterTestingModule.withRoutes([])],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(IotHomeCockpitComponent);
        component = fixture.componentInstance;
        component.userId = 'abc';
        component.userName = 'name';
        component.title = 'zyx';
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
