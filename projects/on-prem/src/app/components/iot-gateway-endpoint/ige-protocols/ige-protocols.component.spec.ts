import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { AppModule } from '../../../app.module';
import { GraphService } from '../../../services/graph/graph.service';

import { IgeProtocolsComponent } from './ige-protocols.component';

describe('IgeProtocolsComponent', () => {
    let component: IgeProtocolsComponent;
    let fixture: ComponentFixture<IgeProtocolsComponent>;
    const mockGraphService = jasmine.createSpyObj(['getProtocols', 'getModels']);

    mockGraphService.getProtocols.and.returnValue(of([]));

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [IgeProtocolsComponent],
            imports: [AppModule],
            providers: [
                { provide: GraphService, useValue: mockGraphService }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(IgeProtocolsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
