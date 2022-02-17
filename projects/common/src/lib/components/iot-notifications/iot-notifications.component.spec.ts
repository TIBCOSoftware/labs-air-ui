import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { GraphService } from '../../services/graph/graph.service';

import { CommonIotNotificationsComponent } from './iot-notifications.component';

describe('IotNotificationsComponent', () => {
    let component: CommonIotNotificationsComponent;
    let fixture: ComponentFixture<CommonIotNotificationsComponent>;
    const mockGraphService = jasmine.createSpyObj(['getNotifications', 'getModels']);

    mockGraphService.getNotifications.and.returnValue(of({

    }));

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ CommonIotNotificationsComponent ],
            providers: [
                { provide: GraphService, useValue: mockGraphService }
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CommonIotNotificationsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
