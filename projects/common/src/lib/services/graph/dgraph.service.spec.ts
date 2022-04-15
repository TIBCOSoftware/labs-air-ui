import { TestBed } from '@angular/core/testing';
import {
    DataStoreService,
    FilterConfigService,
    GatewayService,
    ModelConfigService,
    ModelService,
    NotificationService,
    PipelineService,
    ProtocolService,
    ReadingService,
    RouteService
} from '@TIBCOSoftware/labs-air-graph-client';
import { DGraphService } from './dgraph.service';
import {
    HttpClientTestingModule,
    HttpTestingController
} from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import Axios from 'axios-observable';
import { AppConfigService } from '../config/app-config.service';


describe('DgraphService', () => {
    let dgraphService: DGraphService;
    const httpClientSpy = jasmine.createSpyObj(['get', 'post']);
    let httpTestingController: HttpTestingController;

    const axios: Partial<Axios> = jasmine.createSpyObj(['xxx']);
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

    beforeEach(() => {

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, CommonModule],
            providers: [
                { provide: Axios, useValue: axios },
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
                { provide: HttpClient, useValue: httpClientSpy },
                DGraphService
            ]
        });
        dgraphService = TestBed.inject(DGraphService);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    it('should be created', () => {
        const service: DGraphService = TestBed.inject(DGraphService);
        expect(service).toBeTruthy();
    });
});