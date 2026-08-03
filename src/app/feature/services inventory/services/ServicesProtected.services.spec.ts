import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ServiceProtectedService } from './ServicesProtected.services';
import { environment } from '../../../../environments/environment';
import { ServicesAction, ServicesResponse, ServicePolicyDto, Services } from '../interfaces/services-protected.interface';
import { expect } from 'vitest';

describe('ServiceProtectedService', () => {
  let service: ServiceProtectedService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.API_URL}/services`;

  const mockService: Services = {
    id: 'svc-1',
    name: 'Auth API',
    upstreamUrl: 'https://auth.api.com',
    requiresAuth: true,
    isActive: true,
    createdAt: new Date('2026-01-01'),
    associatedPoliciesCount: 2
  };

  const mockServicesResponse: ServicesResponse = {
    page: 1,
    pageSize: 20,
    totalRecords: 1,
    totalPages: 1,
    data: [mockService]
  };

  const mockServicesAction: ServicesAction = {
    name: 'Payment API',
    upstreamUrl: 'https://pay.api.com',
    requiresAuth: true,
    isActive: true
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ServiceProtectedService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(ServiceProtectedService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('1. should be created', () => {
    expect(service).toBeTruthy();
  });

  it('2. should fetch services list via loadServices', () => {
    service.loadServices({ page: 1, pageSize: 20 }).subscribe((res) => {
      expect(res).toEqual(mockServicesResponse);
    });

    const req = httpMock.expectOne((r) => r.url === baseUrl && r.params.get('page') === '1');
    expect(req.request.method).toBe('GET');
    req.flush(mockServicesResponse);
  });

  it('3. should create a protected service via POST request', () => {
    service.createServices(mockServicesAction).subscribe((res) => {
      expect(res).toEqual(mockServicesResponse);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockServicesAction);
    req.flush(mockServicesResponse);
  });

  it('4. should update an existing service via PUT request', () => {
    service.updateServices(mockServicesAction, 'svc-1').subscribe((res) => {
      expect(res).toEqual(mockServicesResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/svc-1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockServicesAction);
    req.flush(mockServicesResponse);
  });

  it('5. should delete a service via DELETE request', () => {
    service.deleteServices('svc-1').subscribe((res) => {
      expect(res).toEqual(mockServicesResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/svc-1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockServicesResponse);
  });

  it('6. should fetch service policies via getServicePolicies', () => {
    const mockPolicies: ServicePolicyDto[] = [
      { id: 'sp-1', policyId: 'pol-1', policyName: 'Geofence', policyType: 'Geofence', weight: 10, isEnabled: true, policyIsActive: true }
    ];

    service.getServicePolicies('svc-1').subscribe((res) => {
      expect(res).toEqual(mockPolicies);
    });

    const req = httpMock.expectOne(`${baseUrl}/svc-1/policies`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPolicies);
  });

  it('7. should associate a policy with a service via associatePolicy', () => {
    const payload = { policyId: 'pol-2', isEnabled: true };
    const mockDto: ServicePolicyDto = { id: 'sp-2', policyId: 'pol-2', policyName: 'TimeWindow', policyType: 'TimeWindow', weight: 20, isEnabled: true, policyIsActive: true };

    service.associatePolicy('svc-1', payload).subscribe((res) => {
      expect(res).toEqual(mockDto);
    });

    const req = httpMock.expectOne(`${baseUrl}/svc-1/policies`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockDto);
  });

  it('8. should disassociate a policy from a service via disassociatePolicy', () => {
    service.disassociatePolicy('svc-1', 'pol-1').subscribe();

    const req = httpMock.expectOne(`${baseUrl}/svc-1/policies/pol-1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('9. should handle loadServices with undefined params cleanly', () => {
    service.loadServices(undefined).subscribe();

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.params.keys().length).toBe(0);
    req.flush(mockServicesResponse);
  });

  it('10. should handle HTTP errors on service creation gracefully', () => {
    service.createServices(mockServicesAction).subscribe({
      next: () => expect.fail('Should have failed with 409'),
      error: (err) => {
        expect(err.status).toBe(409);
      }
    });

    const req = httpMock.expectOne(baseUrl);
    req.flush({ message: 'Service name already exists' }, { status: 409, statusText: 'Conflict' });
  });
});
