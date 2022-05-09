import { TestBed } from '@angular/core/testing';
import {
    DataStoreService,
    FilterConfigService,
    GatewayService,
    GraphService,
    ModelConfigService,
    ModelService,
    NotificationService,
    PipelineService,
    ProtocolService,
    PythonService,
    ReadingService,
    RouteService
} from '@TIBCOSoftware/labs-air-graph-client';
import { DGraphCloudService } from './dgraph-cloud.service';
import {
    HttpClientTestingModule,
    HttpTestingController
} from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AppConfigService } from 'common';


describe('DgraphService', () => {
    let dgraphService: DGraphCloudService;
    const httpClientSpy = jasmine.createSpyObj(['get', 'post']);
    let httpTestingController: HttpTestingController;

    const httpClient: Partial<HttpClient> = jasmine.createSpyObj(['xxx']);
    const appConfigService: Partial<AppConfigService> = jasmine.createSpyObj(['getFromConfigOrEnv']);
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
    const pythonService: Partial<PythonService> = jasmine.createSpyObj(['xxx']);

    beforeEach(() => {

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, CommonModule],
            providers: [
                { provide: HttpClient, useValue: httpClient },
                { provide: AppConfigService, useValue: appConfigService },
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
                { provide: PythonService, useValue: pythonService },
                { provide: HttpClient, useValue: httpClientSpy },
                DGraphCloudService
            ]
        });
        dgraphService = TestBed.inject(DGraphCloudService);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    it('should be created', () => {
        expect(dgraphService).toBeTruthy();
    });
});