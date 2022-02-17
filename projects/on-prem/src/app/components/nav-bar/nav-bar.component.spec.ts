import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of } from 'rxjs';
import { BreadcrumbsService } from '../../services/breadcrumbs/breadcrumbs.service';
import { GraphService } from '../../services/graph/graph.service';
import { Gateway } from '../../shared/models/iot.model';

import { NavBarComponent } from './nav-bar.component';

describe('NavBarComponent', () => {
    let component: NavBarComponent;
    let fixture: ComponentFixture<NavBarComponent>;

    const mockGraphService = jasmine.createSpyObj(['getGateways', 'getGatewayAndPipelines', 'getModels']);
    const mockBreadCrumbService = jasmine.createSpyObj(['path']);

    mockBreadCrumbService.path = new BehaviorSubject<string[]>([]);
    mockGraphService.getGateways.and.returnValue(of([]));
    mockGraphService.getGatewayAndPipelines.and.returnValue(of([new Gateway()] as Gateway[]));

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [NavBarComponent],
            imports: [RouterTestingModule],
            providers: [
                { provide: BreadcrumbsService, useValue: mockBreadCrumbService },
                { provide: GraphService, useValue: mockGraphService }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NavBarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
