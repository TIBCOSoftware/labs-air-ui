import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppConfigService } from '../../services/config/app-config.service';
import { GraphService } from '../../services/graph/graph.service';

import { CommonIotGatewayDetailsComponent } from './iot-gateway-details.component';

describe('IotGatewayDetailsComponent', () => {
    let component: CommonIotGatewayDetailsComponent;
    let fixture: ComponentFixture<CommonIotGatewayDetailsComponent>;

    const mockAppConfigService: Partial<AppConfigService> = jasmine.createSpyObj(['getFromConfigOrEnv']);
    const mockGraphService: Partial<GraphService> = jasmine.createSpyObj(['xxx']);

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CommonIotGatewayDetailsComponent],
            imports: [HttpClientTestingModule, RouterTestingModule],
            providers: [
                { provide: AppConfigService, useValue: mockAppConfigService },
                { provide: GraphService, useValue: mockGraphService }
            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CommonIotGatewayDetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
