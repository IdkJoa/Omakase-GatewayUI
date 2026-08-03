import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { LogsService } from './logs.services';
import { environment } from '../../../../environments/environment';
import { Logs, Logs_Data } from '../interface/logs.interfaces';
import { expect } from 'vitest';

describe('LogsService', () => {
  let service: LogsService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.API_URL}/logs`;

  const mockLogData: Logs_Data = {
    evaluationId: '1',
    timestamp: new Date('2026-08-03T10:00:00Z'),
    userId: 'u-1',
    username: 'john',
    serviceName: 'Auth-Gateway',
    sourceIp: '192.168.1.1',
    geo: { country: 'US', city: 'NYC', latitude: 40.7128, longitude: -74.0060 },
    userAgent: 'Mozilla/5.0',
    policyScore: 5,
    anomalyScore: 5,
    riskScore: 10,
    verdict: 'ALLOW',
    triggeredRules: ['Rule-1']
  };

  const mockLogsResponse: Logs = {
    page: 1,
    pageSize: 20,
    totalRecords: 1,
    totalPages: 1,
    data: [mockLogData]
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LogsService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(LogsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('1. should be created', () => {
    expect(service).toBeTruthy();
  });

  it('2. should fetch logs without parameters via GET request', () => {
    service.getLogs().subscribe((res) => {
      expect(res).toEqual(mockLogsResponse);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockLogsResponse);
  });

  it('3. should pass page and pageSize parameters when provided', () => {
    service.getLogs({ page: 2, pageSize: 50 }).subscribe((res) => {
      expect(res.data.length).toBe(1);
    });

    const req = httpMock.expectOne((request) =>
      request.url === baseUrl &&
      request.params.get('page') === '2' &&
      request.params.get('pageSize') === '50'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockLogsResponse);
  });

  it('4. should handle extra custom filter parameters in request', () => {
    service.getLogs({ page: 1, pageSize: 20, verdict: 'BLOCK' }).subscribe();

    const req = httpMock.expectOne((request) =>
      request.url === baseUrl &&
      request.params.get('verdict') === 'BLOCK'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockLogsResponse);
  });

  it('5. should handle empty data response list correctly', () => {
    service.getLogs().subscribe((res) => {
      expect(res.data).toEqual([]);
      expect(res.totalRecords).toBe(0);
    });

    const req = httpMock.expectOne(baseUrl);
    req.flush({ page: 1, pageSize: 20, totalRecords: 0, totalPages: 0, data: [] });
  });

  it('6. should handle HTTP 500 server error gracefully', () => {
    service.getLogs().subscribe({
      next: () => expect.fail('Should have failed with 500 error'),
      error: (error) => {
        expect(error.status).toBe(500);
        expect(error.statusText).toBe('Internal Server Error');
      }
    });

    const req = httpMock.expectOne(baseUrl);
    req.flush({ message: 'Database Connection Error' }, { status: 500, statusText: 'Internal Server Error' });
  });

  it('7. should handle HTTP 404 not found error gracefully', () => {
    service.getLogs().subscribe({
      next: () => expect.fail('Should have failed with 404 error'),
      error: (error) => {
        expect(error.status).toBe(404);
      }
    });

    const req = httpMock.expectOne(baseUrl);
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });
  });

  it('8. should handle undefined params explicitly by omitting query parameters', () => {
    service.getLogs(undefined).subscribe();

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.params.keys().length).toBe(0);
    req.flush(mockLogsResponse);
  });

  it('9. should handle multiple log records in response payload', () => {
    const multiLogs: Logs = {
      page: 1,
      pageSize: 20,
      totalRecords: 2,
      totalPages: 1,
      data: [
        { ...mockLogData, evaluationId: '1', verdict: 'ALLOW' },
        { ...mockLogData, evaluationId: '2', verdict: 'BLOCK' }
      ]
    };

    service.getLogs().subscribe((res) => {
      expect(res.data.length).toBe(2);
      expect(res.data[1].verdict).toBe('BLOCK');
    });

    const req = httpMock.expectOne(baseUrl);
    req.flush(multiLogs);
  });

  it('10. should cancel duplicate in-flight requests when subscribed multiple times', () => {
    service.getLogs({ page: 1, pageSize: 10 }).subscribe();
    service.getLogs({ page: 1, pageSize: 10 }).subscribe();

    const requests = httpMock.match((r) => r.url === baseUrl);
    expect(requests.length).toBe(2);
    requests[0].flush(mockLogsResponse);
    requests[1].flush(mockLogsResponse);
  });
});
