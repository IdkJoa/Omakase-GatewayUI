import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { RiskConfigurationService } from './risk-configuration.service';
import { environment } from '../../../../environments/environment';
import { RiskConfigurationRequest, RiskConfigurationResponse } from '../interfaces/risk-configuration.interface';
import { expect } from 'vitest';

describe('RiskConfigurationService', () => {
  let service: RiskConfigurationService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.API_URL}/risk-config`;

  const mockRiskConfigResponse: RiskConfigurationResponse = {
    id: 'cfg-1',
    policyWeight: 0.5,
    anomalyWeight: 0.5,
    coldStartPenalty: 10,
    coldStartN: 5,
    blockThreshold: 80,
    challengeThreshold: 50,
    updatedAt: '2026-08-03T12:00:00Z',
  };

  const mockRiskConfigRequest: RiskConfigurationRequest = {
    policyWeight: 0.6,
    anomalyWeight: 0.4,
    coldStartPenalty: 12,
    coldStartN: 6,
    blockThreshold: 85,
    challengeThreshold: 55,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RiskConfigurationService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(RiskConfigurationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('1. should be created', () => {
    expect(service).toBeTruthy();
  });

  it('2. should fetch risk configuration via GET request', () => {
    service.getRiskConfig().subscribe((res) => {
      expect(res).toEqual(mockRiskConfigResponse);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockRiskConfigResponse);
  });

  it('3. should update risk configuration via PUT request with valid payload', () => {
    service.updateRiskConfig(mockRiskConfigRequest).subscribe((res) => {
      expect(res.policyWeight).toBe(0.6);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockRiskConfigRequest);
    req.flush({ ...mockRiskConfigResponse, ...mockRiskConfigRequest });
  });

  it('4. should handle HTTP 500 error on getRiskConfig gracefully', () => {
    service.getRiskConfig().subscribe({
      next: () => expect.fail('Should have failed with 500'),
      error: (err) => {
        expect(err.status).toBe(500);
      }
    });

    const req = httpMock.expectOne(baseUrl);
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
  });

  it('5. should handle HTTP 400 validation error on updateRiskConfig gracefully', () => {
    service.updateRiskConfig(mockRiskConfigRequest).subscribe({
      next: () => expect.fail('Should have failed with 400'),
      error: (err) => {
        expect(err.status).toBe(400);
      }
    });

    const req = httpMock.expectOne(baseUrl);
    req.flush({ message: 'Sum of weights must equal 1' }, { status: 400, statusText: 'Bad Request' });
  });

  it('6. should handle HTTP 401 unauthorized error gracefully', () => {
    service.getRiskConfig().subscribe({
      next: () => expect.fail('Should have failed with 401'),
      error: (err) => {
        expect(err.status).toBe(401);
      }
    });

    const req = httpMock.expectOne(baseUrl);
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
  });

  it('7. should handle HTTP 403 forbidden error gracefully', () => {
    service.updateRiskConfig(mockRiskConfigRequest).subscribe({
      next: () => expect.fail('Should have failed with 403'),
      error: (err) => {
        expect(err.status).toBe(403);
      }
    });

    const req = httpMock.expectOne(baseUrl);
    req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
  });

  it('8. should return updated response object with new id and timestamp', () => {
    const updatedResponse = { ...mockRiskConfigResponse, updatedAt: '2026-08-03T14:00:00Z' };

    service.updateRiskConfig(mockRiskConfigRequest).subscribe((res) => {
      expect(res.updatedAt).toBe('2026-08-03T14:00:00Z');
    });

    const req = httpMock.expectOne(baseUrl);
    req.flush(updatedResponse);
  });

  it('9. should handle empty response payload gracefully', () => {
    service.getRiskConfig().subscribe((res) => {
      expect(res).toEqual({} as any);
    });

    const req = httpMock.expectOne(baseUrl);
    req.flush({});
  });

  it('10. should allow multiple sequential calls to getRiskConfig', () => {
    service.getRiskConfig().subscribe();
    service.getRiskConfig().subscribe();

    const reqs = httpMock.match(baseUrl);
    expect(reqs.length).toBe(2);
    reqs[0].flush(mockRiskConfigResponse);
    reqs[1].flush(mockRiskConfigResponse);
  });
});
