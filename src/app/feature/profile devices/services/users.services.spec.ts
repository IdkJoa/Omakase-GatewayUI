import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { UserService } from './users.services';
import { environment } from '../../../../environments/environment';
import { ProfileResponse, ProfileDevices } from '../interfaces/profile-devices.interface';
import { UserProfileDto, MfaStatusDto, MfaEnrollmentResponse } from '../interfaces/user-profile.interface';
import { expect } from 'vitest';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.API_URL}/users`;

  const mockProfileDevice: ProfileDevices = {
    id: 'u-1',
    username: 'john',
    userType: 'ADMIN',
    isActive: true,
    failedAttempts: 0,
    lockedUntil: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: null,
    roles: ['ADMIN'],
    behaviorProfile: { accessCount: 10, lastAccessAt: new Date('2026-01-01'), avgRequestsPerHour: 5, uniqueEndpointsCount: 2 }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('1. should be created', () => {
    expect(service).toBeTruthy();
  });

  it('2. should fetch users list via LoadUsers', () => {
    const mockResponse: ProfileResponse = {
      page: 1,
      pageSize: 20,
      totalRecords: 1,
      totalPages: 1,
      data: [mockProfileDevice]
    };

    service.LoadUsers({ page: 1, pageSize: 20 }).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne((r) => r.url === baseUrl && r.params.get('page') === '1');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('3. should fetch user profile details via getUserProfile', () => {
    const mockProfile: UserProfileDto = {
      userId: 'u-1',
      username: 'john',
      accessCount: 10,
      isColdStart: false,
      baseRiskPenalty: 0,
      lastTrainedAt: '2026-01-01',
      featureVector: null,
      recentAccesses: []
    };

    service.getUserProfile('u-1').subscribe((res) => {
      expect(res).toEqual(mockProfile);
    });

    const req = httpMock.expectOne(`${baseUrl}/u-1/profile`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProfile);
  });

  it('4. should fetch MFA status via getMfaStatus', () => {
    const mockMfa: MfaStatusDto = { userId: 'u-1', username: 'john', mfaEnabled: true, enrollmentPending: false, locked: false, lockedUntil: null };

    service.getMfaStatus('u-1').subscribe((res) => {
      expect(res).toEqual(mockMfa);
    });

    const req = httpMock.expectOne(`${baseUrl}/u-1/mfa`);
    expect(req.request.method).toBe('GET');
    req.flush(mockMfa);
  });

  it('5. should initiate MFA enrollment via enrollMfa', () => {
    const mockEnroll: MfaEnrollmentResponse = { provisioningUri: 'otpauth://totp/omakase?secret=123' };

    service.enrollMfa('u-1').subscribe((res) => {
      expect(res).toEqual(mockEnroll);
    });

    const req = httpMock.expectOne(`${baseUrl}/u-1/mfa/enroll`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush(mockEnroll);
  });

  it('6. should confirm MFA enrollment with OTP via confirmMfaEnrollment', () => {
    const mockMfaStatus: MfaStatusDto = { userId: 'u-1', username: 'john', mfaEnabled: true, enrollmentPending: false, locked: false, lockedUntil: null };

    service.confirmMfaEnrollment('u-1', '123456').subscribe((res) => {
      expect(res.mfaEnabled).toBe(true);
    });

    const req = httpMock.expectOne(`${baseUrl}/u-1/mfa/enroll/confirm`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ otp: '123456' });
    req.flush(mockMfaStatus);
  });

  it('7. should reset MFA via resetMfa', () => {
    const mockStatus: MfaStatusDto = { userId: 'u-1', username: 'john', mfaEnabled: false, enrollmentPending: false, locked: false, lockedUntil: null };

    service.resetMfa('u-1').subscribe((res) => {
      expect(res.mfaEnabled).toBe(false);
    });

    const req = httpMock.expectOne(`${baseUrl}/u-1/mfa/reset`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush(mockStatus);
  });

  it('8. should handle LoadUsers with null/undefined params gracefully', () => {
    service.LoadUsers(null).subscribe();

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.params.keys().length).toBe(0);
    req.flush({ page: 1, pageSize: 20, totalRecords: 0, totalPages: 0, data: [] });
  });

  it('9. should handle HTTP errors on getUserProfile gracefully', () => {
    service.getUserProfile('non-existent').subscribe({
      next: () => expect.fail('Should have failed with 404'),
      error: (err) => {
        expect(err.status).toBe(404);
      }
    });

    const req = httpMock.expectOne(`${baseUrl}/non-existent/profile`);
    req.flush('User not found', { status: 404, statusText: 'Not Found' });
  });

  it('10. should handle invalid OTP error on confirmMfaEnrollment gracefully', () => {
    service.confirmMfaEnrollment('u-1', '000000').subscribe({
      next: () => expect.fail('Should have failed with 400'),
      error: (err) => {
        expect(err.status).toBe(400);
      }
    });

    const req = httpMock.expectOne(`${baseUrl}/u-1/mfa/enroll/confirm`);
    req.flush({ message: 'Invalid OTP code' }, { status: 400, statusText: 'Bad Request' });
  });
});
