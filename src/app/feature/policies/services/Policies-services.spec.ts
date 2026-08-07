import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PoliciesService } from './Policies-services';
import { environment } from '../../../../environments/environment';
import { Policies, PoliciesAction, PoliciesResponse } from '../interfaces/policies.interface';
import { expect } from 'vitest';

describe('PoliciesService', () => {
  let service: PoliciesService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.API_URL}/policies`;

  const mockPolicy: Policies = {
    id: 'pol-1',
    name: 'Geofence Policy',
    type: 'Geofence',
    config: { allowedCountries: ['US'] },
    weight: 25,
    isActive: true,
    createdById: 'u-1',
    createdByUsername: 'admin',
    createdAt: new Date('2026-01-01')
  };

  const mockPolicyAction: PoliciesAction = {
    name: 'New Policy',
    type: 'Geofence',
    config: { allowedCountries: ['MX'] },
    weight: 20,
    isActive: true
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PoliciesService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(PoliciesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('1. should be created', () => {
    expect(service).toBeTruthy();
  });

  it('2. should load policies via GET request', () => {
    const mockResponse: PoliciesResponse = { page: 1, pageSize: 20, totalRecords: 1, totalPages: 1, data: [mockPolicy] };

    service.loadPolicies().subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('3. should pass query parameters in loadPolicies', () => {
    service.loadPolicies({ page: 1, pageSize: 10, type: 'Geofence' }).subscribe();

    const req = httpMock.expectOne((r) =>
      r.url === baseUrl &&
      r.params.get('page') === '1' &&
      r.params.get('type') === 'Geofence'
    );
    expect(req.request.method).toBe('GET');
    req.flush({ page: 1, pageSize: 10, totalRecords: 0, totalPages: 0, data: [] });
  });

  it('4. should create a policy via POST request', () => {
    service.createPolicies(mockPolicyAction).subscribe((res) => {
      expect(res).toEqual(mockPolicy);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockPolicyAction);
    req.flush(mockPolicy);
  });

  it('5. should update an existing policy via PUT request', () => {
    service.updatePolicies(mockPolicyAction, 'pol-1').subscribe((res) => {
      expect(res.id).toBe('pol-1');
    });

    const req = httpMock.expectOne(`${baseUrl}/pol-1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockPolicyAction);
    req.flush(mockPolicy);
  });

  it('6. should delete a policy via DELETE request', () => {
    service.deletePolicies('pol-1').subscribe((res) => {
      expect(res).toBe(true);
    });

    const req = httpMock.expectOne(`${baseUrl}/pol-1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(true);
  });

  it('7. should handle HTTP error on createPolicies gracefully', () => {
    service.createPolicies(mockPolicyAction).subscribe({
      next: () => expect.fail('Should have failed with 400 error'),
      error: (err) => {
        expect(err.status).toBe(400);
      }
    });

    const req = httpMock.expectOne(baseUrl);
    req.flush({ message: 'Invalid payload' }, { status: 400, statusText: 'Bad Request' });
  });

  it('8. should handle HTTP error on updatePolicies gracefully', () => {
    service.updatePolicies(mockPolicyAction, 'invalid-id').subscribe({
      next: () => expect.fail('Should have failed with 404 error'),
      error: (err) => {
        expect(err.status).toBe(404);
      }
    });

    const req = httpMock.expectOne(`${baseUrl}/invalid-id`);
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });
  });

  it('9. should handle HTTP error on deletePolicies gracefully', () => {
    service.deletePolicies('pol-99').subscribe({
      next: () => expect.fail('Should fail on 500'),
      error: (err) => {
        expect(err.status).toBe(500);
      }
    });

    const req = httpMock.expectOne(`${baseUrl}/pol-99`);
    req.flush('Error deleting policy', { status: 500, statusText: 'Internal Server Error' });
  });

  it('10. should handle loadPolicies with undefined params by executing a clean request', () => {
    service.loadPolicies(undefined).subscribe();

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.params.keys().length).toBe(0);
    req.flush({ page: 1, pageSize: 20, totalRecords: 0, totalPages: 0, data: [] });
  });
});
