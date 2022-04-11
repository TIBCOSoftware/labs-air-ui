import { TestBed } from '@angular/core/testing';
import { DataStoreService, FilterConfigService, Gateway, GatewayService, ModelConfigService, ModelService, NotificationService, PipelineService, ProtocolService, ReadingService, RouteService } from '@TIBCOSoftware/labs-air-graph-service';
import { DgraphService } from './dgraph.service';
import {
    HttpClientTestingModule,
    HttpTestingController
} from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';


describe('DgraphService', () => {
    let dgraphService: DgraphService;
    const httpClientSpy = jasmine.createSpyObj(['get', 'post']);
    let httpTestingController: HttpTestingController;

    const dataStoreService: Partial<DataStoreService> = jasmine.createSpyObj(['xxx']);
    const filterConfigService: Partial<FilterConfigService> = jasmine.createSpyObj(['xxx']);
    const mockGatewayService: Partial<GatewayService> = jasmine.createSpyObj(['getGateways', 'getGatewayAndPipelines', 'getModels']);
    const modelService: Partial<ModelService> = jasmine.createSpyObj(['xxx']);
    const modelConfigService: Partial<ModelConfigService> = jasmine.createSpyObj(['xxx']);
    const notificationService: Partial<NotificationService> = jasmine.createSpyObj(['xxx']);
    const pipelineService: Partial<PipelineService> = jasmine.createSpyObj(['xxx']);
    const protocolService: Partial<ProtocolService> = jasmine.createSpyObj(['xxx']);
    const readingService: Partial<ReadingService> = jasmine.createSpyObj(['xxx']);
    const routeService: Partial<RouteService> = jasmine.createSpyObj(['xxx']);

    beforeEach(() => {

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, CommonModule],
            providers: [
                DgraphService,
                { provide: DataStoreService, useValue: dataStoreService },
                { provide: FilterConfigService, useValue: filterConfigService },
                { provide: GatewayService, useValue: mockGatewayService },
                { provide: ModelService, useValue: modelService },
                { provide: ModelConfigService, useValue: modelConfigService },
                { provide: NotificationService, useValue: notificationService },
                { provide: PipelineService, useValue: pipelineService },
                { provide: ProtocolService, useValue: protocolService },
                { provide: ReadingService, useValue: readingService },
                { provide: RouteService, useValue: routeService },
                { provide: HttpClient, useValue: httpClientSpy }
            ]
        });
        dgraphService = TestBed.inject(DgraphService);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    it('should be created', () => {
        const service: DgraphService = TestBed.inject(DgraphService);
        expect(service).toBeTruthy();
    });
});