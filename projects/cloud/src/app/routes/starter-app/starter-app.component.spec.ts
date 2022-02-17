import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { AppConfigService } from '../../services/config/app-config.service';
import { EdgeService } from '../../services/edge/edge.service';
import { GraphService } from '../../services/graph/graph.service';
import { Gateway } from '../../shared/models/iot.model';

import { StarterAppComponent } from './starter-app.component';

describe('StarterAppComponent', () => {
    let component: StarterAppComponent;
    let fixture: ComponentFixture<StarterAppComponent>;

    const mockGraphService = jasmine.createSpyObj(['getGatewayAndPipelines', 'getModels']);
    const mockAppConfigService: Partial<AppConfigService> = jasmine.createSpyObj(['getFromConfigOrEnv']);
    const mockEdgeService = jasmine.createSpyObj(['getDevices']);

    mockGraphService.getGatewayAndPipelines.and.returnValue(of([new Gateway()] as Gateway[]));
    mockEdgeService.getDevices.and.returnValue(of([]));

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [StarterAppComponent],
            imports: [HttpClientTestingModule, RouterTestingModule],
            providers: [
                { provide: AppConfigService, useValue: mockAppConfigService },
                { provide: GraphService, useValue: mockGraphService },
                { provide: EdgeService, useValue: mockEdgeService },
                { provide: ActivatedRoute, 
                    useValue: {
                        snapshot: {
                            data: {
                                config: {
                                    browserTitle: 'test',
                                }
                            }
                        }  
                    }
                }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
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
