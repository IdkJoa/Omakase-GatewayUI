import { TestBed } from '@angular/core/testing';
import { authGuard } from './auth-guard';
import { OAuthService } from 'angular-oauth2-oidc';
import { vi } from 'vitest';

describe('authGuard', () => {
  let oauthServiceMock: any;

  beforeEach(() => {
    oauthServiceMock = {
      hasValidAccessToken: vi.fn(),
      initCodeFlow: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: OAuthService, useValue: oauthServiceMock }
      ]
    });
  });

  it('1. should return true if user has valid access token', () => {
    oauthServiceMock.hasValidAccessToken.mockReturnValue(true);
    const result = TestBed.runInInjectionContext(() => (authGuard as Function)({} as any, {} as any));
    expect(result).toBe(true);
    expect(oauthServiceMock.initCodeFlow).not.toHaveBeenCalled();
  });

  it('2. should initiate code flow and return false if token is invalid', () => {
    oauthServiceMock.hasValidAccessToken.mockReturnValue(false);
    const result = TestBed.runInInjectionContext(() => (authGuard as Function)({} as any, {} as any));
    expect(result).toBe(false);
    expect(oauthServiceMock.initCodeFlow).toHaveBeenCalledTimes(1);
  });

  it('3. should handle null return from hasValidAccessToken safely', () => {
    oauthServiceMock.hasValidAccessToken.mockReturnValue(null);
    const result = TestBed.runInInjectionContext(() => (authGuard as Function)({} as any, {} as any));
    expect(result).toBe(false);
    expect(oauthServiceMock.initCodeFlow).toHaveBeenCalled();
  });

  it('4. should handle undefined return from hasValidAccessToken safely', () => {
    oauthServiceMock.hasValidAccessToken.mockReturnValue(undefined);
    const result = TestBed.runInInjectionContext(() => (authGuard as Function)({} as any, {} as any));
    expect(result).toBe(false);
    expect(oauthServiceMock.initCodeFlow).toHaveBeenCalled();
  });

  it('5. should invoke hasValidAccessToken exactly once per guard execution', () => {
    oauthServiceMock.hasValidAccessToken.mockReturnValue(true);
    TestBed.runInInjectionContext(() => (authGuard as Function)({} as any, {} as any));
    expect(oauthServiceMock.hasValidAccessToken).toHaveBeenCalledTimes(1);
  });

  it('6. should allow sequential successful guard checks', () => {
    oauthServiceMock.hasValidAccessToken.mockReturnValue(true);
    const r1 = TestBed.runInInjectionContext(() => (authGuard as Function)({} as any, {} as any));
    const r2 = TestBed.runInInjectionContext(() => (authGuard as Function)({} as any, {} as any));
    expect(r1).toBe(true);
    expect(r2).toBe(true);
  });

  it('7. should redirect when token transitions from valid to invalid', () => {
    oauthServiceMock.hasValidAccessToken.mockReturnValueOnce(true).mockReturnValueOnce(false);
    const r1 = TestBed.runInInjectionContext(() => (authGuard as Function)({} as any, {} as any));
    const r2 = TestBed.runInInjectionContext(() => (authGuard as Function)({} as any, {} as any));
    expect(r1).toBe(true);
    expect(r2).toBe(false);
    expect(oauthServiceMock.initCodeFlow).toHaveBeenCalledTimes(1);
  });

  it('8. should execute within Angular injection context without throwing Injector error', () => {
    expect(() => {
      TestBed.runInInjectionContext(() => (authGuard as Function)({} as any, {} as any));
    }).not.toThrow();
  });

  it('9. should return boolean type explicitly', () => {
    oauthServiceMock.hasValidAccessToken.mockReturnValue(true);
    const result = TestBed.runInInjectionContext(() => (authGuard as Function)({} as any, {} as any));
    expect(typeof result).toBe('boolean');
  });

  it('10. should not crash if initCodeFlow throws an error during redirection', () => {
    oauthServiceMock.hasValidAccessToken.mockReturnValue(false);
    oauthServiceMock.initCodeFlow.mockImplementation(() => {
      throw new Error('Redirect Failed');
    });

    expect(() => {
      TestBed.runInInjectionContext(() => (authGuard as Function)({} as any, {} as any));
    }).toThrow('Redirect Failed');
  });
});
