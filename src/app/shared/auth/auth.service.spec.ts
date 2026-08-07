import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { OAuthService, OAuthErrorEvent } from 'angular-oauth2-oidc';
import { Subject } from 'rxjs';
import { vi } from 'vitest';

describe('AuthService', () => {
  let service: AuthService;
  let oauthServiceMock: any;
  let eventsSubject: Subject<any>;

  beforeEach(() => {
    eventsSubject = new Subject();
    oauthServiceMock = {
      configure: vi.fn(),
      setupAutomaticSilentRefresh: vi.fn(),
      loadDiscoveryDocumentAndLogin: vi.fn().mockResolvedValue(undefined),
      hasValidAccessToken: vi.fn().mockReturnValue(true),
      initCodeFlow: vi.fn(),
      getAccessToken: vi.fn().mockReturnValue('mock-token'),
      getIdentityClaims: vi.fn().mockReturnValue({
        realm_access: { roles: ['ADMIN', 'user'] }
      }),
      logOut: vi.fn(),
      events: eventsSubject.asObservable()
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: OAuthService, useValue: oauthServiceMock }
      ]
    });

    service = TestBed.inject(AuthService);
  });

  it('1. should be created properly', () => {
    expect(service).toBeTruthy();
  });

  it('2. should return access token from oauthService', () => {
    expect(service.token).toBe('mock-token');
    expect(oauthServiceMock.getAccessToken).toHaveBeenCalled();
  });

  it('3. should return identityClaims from oauthService', () => {
    expect(service.identityClaims).toEqual({ realm_access: { roles: ['ADMIN', 'user'] } });
  });

  it('4. should correctly identify ADMIN role (case insensitive)', () => {
    expect(service.hasRole('admin')).toBe(true);
    expect(service.isAdmin).toBe(true);
    expect(service.isViewer).toBe(false);
  });

  it('5. should identify VIEWER role correctly when user is VIEWER', () => {
    oauthServiceMock.getIdentityClaims.mockReturnValue({
      realm_access: { roles: ['VIEWER'] }
    });

    expect(service.isAdmin).toBe(false);
    expect(service.isViewer).toBe(true);
  });

  it('6. should return false for hasRole when claims or realm_access is missing', () => {
    oauthServiceMock.getIdentityClaims.mockReturnValue(null);
    expect(service.hasRole('ADMIN')).toBe(false);

    oauthServiceMock.getIdentityClaims.mockReturnValue({ realm_access: null });
    expect(service.hasRole('ADMIN')).toBe(false);
  });

  it('7. should call logOut on oauthService when logout is called', () => {
    service.logout();
    expect(oauthServiceMock.logOut).toHaveBeenCalled();
  });

  it('8. should initialize auth and setup silent refresh', async () => {
    await service.initializeAuth();
    expect(oauthServiceMock.configure).toHaveBeenCalled();
    expect(oauthServiceMock.setupAutomaticSilentRefresh).toHaveBeenCalled();
    expect(oauthServiceMock.loadDiscoveryDocumentAndLogin).toHaveBeenCalled();
  });

  it('9. should trigger initCodeFlow if user has no valid access token on init', async () => {
    oauthServiceMock.hasValidAccessToken.mockReturnValue(false);
    await service.initializeAuth();
    expect(oauthServiceMock.initCodeFlow).toHaveBeenCalled();
  });

  it('10. should handle discovery document error and clear session storage gracefully', async () => {
    sessionStorage.setItem('oidc.test_key', 'val');
    oauthServiceMock.loadDiscoveryDocumentAndLogin.mockRejectedValue(new Error('Discovery Error'));

    await service.initializeAuth();
    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(sessionStorage.getItem('oidc.test_key')).toBeNull();
    expect(oauthServiceMock.initCodeFlow).toHaveBeenCalled();
  });
});
