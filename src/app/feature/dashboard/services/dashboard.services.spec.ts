import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { DashboardService } from './dashboard.services';
import { environment } from '../../../../environments/environment';
import { Metrics } from '../interfaces/dashboard.interface';
import { expect } from 'vitest';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.API_URL}/metrics/summary`;

  const mockMetrics: Metrics = {
    totalEvaluations: 15420,
    allowedCount: 12000,
    challengedCount: 2000,
    blockedCount: 1420,
    allowedPercent: 77.8,
    challengedPercent: 13.0,
    blockedPercent: 9.2,
    averageRiskScore: 18.5,
    uniqueUsers: 450,
    riskScoreSeries: [
      { timestamp: new Date('2026-08-03T10:00:00Z'), avgScore: 15.2, evaluationCount: 500 }
    ]
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DashboardService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('1. should be created properly', () => {
    expect(service).toBeTruthy();
  });

  it('2. should fetch dashboard metrics summary via GET request', () => {
    service.getMetrics().subscribe((res) => {
      expect(res).toEqual(mockMetrics);
      expect(res.totalEvaluations).toBe(15420);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockMetrics);
  });

  it('3. should handle empty metrics object gracefully', () => {
    const emptyMetrics: Metrics = {
      totalEvaluations: 0,
      allowedCount: 0,
      challengedCount: 0,
      blockedCount: 0,
      allowedPercent: 0,
      challengedPercent: 0,
      blockedPercent: 0,
      averageRiskScore: 0,
      uniqueUsers: 0,
      riskScoreSeries: []
    };

    service.getMetrics().subscribe((res) => {
      expect(res.totalEvaluations).toBe(0);
      expect(res.riskScoreSeries.length).toBe(0);
    });

    const req = httpMock.expectOne(baseUrl);
    req.flush(emptyMetrics);
  });

  it('4. should handle HTTP 500 server error gracefully', () => {
    service.getMetrics().subscribe({
      next: () => expect.fail('Should have failed with 500'),
      error: (err) => {
        expect(err.status).toBe(500);
      }
    });

    const req = httpMock.expectOne(baseUrl);
    req.flush('Metrics calculation failure', { status: 500, statusText: 'Internal Server Error' });
  });

  it('5. should handle HTTP 401 unauthorized error gracefully', () => {
    service.getMetrics().subscribe({
      next: () => expect.fail('Should have failed with 401'),
      error: (err) => {
        expect(err.status).toBe(401);
      }
    });

    const req = httpMock.expectOne(baseUrl);
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
  });

  it('6. should handle HTTP 403 forbidden error gracefully', () => {
    service.getMetrics().subscribe({
      next: () => expect.fail('Should have failed with 403'),
      error: (err) => {
        expect(err.status).toBe(403);
      }
    });

    const req = httpMock.expectOne(baseUrl);
    req.flush('Forbidden access', { status: 403, statusText: 'Forbidden' });
  });

  it('7. should handle HTTP network timeout or offline error', () => {
    service.getMetrics().subscribe({
      next: () => expect.fail('Should have failed with 0 network status'),
      error: (err) => {
        expect(err.status).toBe(0);
      }
    });

    const req = httpMock.expectOne(baseUrl);
    req.error(new ProgressEvent('error'));
  });

  it('8. should return correct structure for riskScoreSeries list', () => {
    service.getMetrics().subscribe((res) => {
      expect(res.riskScoreSeries[0].avgScore).toBe(15.2);
      expect(res.riskScoreSeries[0].evaluationCount).toBe(500);
    });

    const req = httpMock.expectOne(baseUrl);
    req.flush(mockMetrics);
  });

  it('9. should handle high throughput metrics response values without overflow', () => {
    const highVolumeMetrics: Metrics = {
      ...mockMetrics,
      totalEvaluations: 999999999,
      blockedCount: 50000000
    };

    service.getMetrics().subscribe((res) => {
      expect(res.totalEvaluations).toBe(999999999);
    });

    const req = httpMock.expectOne(baseUrl);
    req.flush(highVolumeMetrics);
  });

  it('10. should allow multiple consecutive getMetrics requests', () => {
    service.getMetrics().subscribe();
    service.getMetrics().subscribe();

    const reqs = httpMock.match(baseUrl);
    expect(reqs.length).toBe(2);
    reqs[0].flush(mockMetrics);
    reqs[1].flush(mockMetrics);
  });
});
