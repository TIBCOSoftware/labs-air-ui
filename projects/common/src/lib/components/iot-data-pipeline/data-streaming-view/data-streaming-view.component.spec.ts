import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DataStreamingViewComponent } from './data-streaming-view.component';

describe('DataStreamingViewComponent', () => {
    let component: DataStreamingViewComponent;
    let fixture: ComponentFixture<DataStreamingViewComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ DataStreamingViewComponent ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DataStreamingViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
