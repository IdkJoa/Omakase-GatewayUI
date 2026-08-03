import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandlerFn, HttpHeaders, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';
import { OAuthService } from 'angular-oauth2-oidc';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

describe('authInterceptor', () => {
  let oauthServiceMock: any;

  beforeEach(() => {
    oauthServiceMock = {
      getAccessToken: vi.fn(),
      initCodeFlow: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: OAuthService, useValue: oauthServiceMock },
      ],
    });
  });

  it('1. should add Authorization header when access token is present', () => {
    oauthServiceMock.getAccessToken.mockReturnValue('valid-jwt-token');

    const req = new HttpRequest('GET', '/api/test');
    let capturedReq: HttpRequest<any> | null = null;
    const next: HttpHandlerFn = (clonedReq) => {
      capturedReq = clonedReq;
      return of(new HttpResponse({ status: 200 }));
    };

    TestBed.runInInjectionContext(() => {
      authInterceptor(req, next).subscribe();
    });

    expect(capturedReq).not.toBeNull();
    expect(capturedReq!.headers.get('Authorization')).toBe('Bearer valid-jwt-token');
  });

  it('2. should not add Authorization header when access token is null', () => {
    oauthServiceMock.getAccessToken.mockReturnValue(null);

    const req = new HttpRequest('GET', '/api/test');
    let capturedReq: HttpRequest<any> | null = null;
    const next: HttpHandlerFn = (clonedReq) => {
      capturedReq = clonedReq;
      return of(new HttpResponse({ status: 200 }));
    };

    TestBed.runInInjectionContext(() => {
      authInterceptor(req, next).subscribe();
    });

    expect(capturedReq!.headers.has('Authorization')).toBe(false);
  });

  it('3. should not add Authorization header when access token is empty string', () => {
    oauthServiceMock.getAccessToken.mockReturnValue('');

    const req = new HttpRequest('GET', '/api/test');
    let capturedReq: HttpRequest<any> | null = null;
    const next: HttpHandlerFn = (clonedReq) => {
      capturedReq = clonedReq;
      return of(new HttpResponse({ status: 200 }));
    };

    TestBed.runInInjectionContext(() => {
      authInterceptor(req, next).subscribe();
    });

    expect(capturedReq!.headers.has('Authorization')).toBe(false);
  });

  it('4. should trigger initCodeFlow and rethrow on HTTP 401 error', () => {
    oauthServiceMock.getAccessToken.mockReturnValue('expired-token');

    const req = new HttpRequest('GET', '/api/test');
    const error401 = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    const next: HttpHandlerFn = () => throwError(() => error401);

    let capturedError: any = null;
    TestBed.runInInjectionContext(() => {
      authInterceptor(req, next).subscribe({
        error: (err) => {
          capturedError = err;
        },
      });
    });

    expect(capturedError.status).toBe(401);
    expect(oauthServiceMock.initCodeFlow).toHaveBeenCalled();
  });

  it('5. should NOT trigger initCodeFlow on HTTP 500 error', () => {
    oauthServiceMock.getAccessToken.mockReturnValue('valid-token');

    const req = new HttpRequest('GET', '/api/test');
    const error500 = new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error' });
    const next: HttpHandlerFn = () => throwError(() => error500);

    let capturedError: any = null;
    TestBed.runInInjectionContext(() => {
      authInterceptor(req, next).subscribe({
        error: (err) => {
          capturedError = err;
        },
      });
    });

    expect(capturedError.status).toBe(500);
    expect(oauthServiceMock.initCodeFlow).not.toHaveBeenCalled();
  });

  it('6. should NOT trigger initCodeFlow on HTTP 403 Forbidden error', () => {
    oauthServiceMock.getAccessToken.mockReturnValue('valid-token');

    const req = new HttpRequest('GET', '/api/test');
    const error403 = new HttpErrorResponse({ status: 403, statusText: 'Forbidden' });
    const next: HttpHandlerFn = () => throwError(() => error403);

    let capturedError: any = null;
    TestBed.runInInjectionContext(() => {
      authInterceptor(req, next).subscribe({
        error: (err) => {
          capturedError = err;
        },
      });
    });

    expect(capturedError.status).toBe(403);
    expect(oauthServiceMock.initCodeFlow).not.toHaveBeenCalled();
  });

  it('7. should preserve existing headers when cloning request with token', () => {
    oauthServiceMock.getAccessToken.mockReturnValue('token-xyz');

    const headers = new HttpHeaders().set('X-Custom-Header', 'custom-value');
    const req = new HttpRequest('POST', '/api/data', {}, { headers });
    let capturedReq: HttpRequest<any> | null = null;
    const next: HttpHandlerFn = (clonedReq) => {
      capturedReq = clonedReq;
      return of(new HttpResponse({ status: 201 }));
    };

    TestBed.runInInjectionContext(() => {
      authInterceptor(req, next).subscribe();
    });

    expect(capturedReq!.headers.get('X-Custom-Header')).toBe('custom-value');
    expect(capturedReq!.headers.get('Authorization')).toBe('Bearer token-xyz');
  });

  it('8. should pass through successful responses without modification', () => {
    oauthServiceMock.getAccessToken.mockReturnValue('valid-token');

    const req = new HttpRequest('GET', '/api/data');
    const mockResponse = new HttpResponse({ status: 200, body: { data: 'test' } });
    const next: HttpHandlerFn = () => of(mockResponse);

    let capturedRes: any = null;
    TestBed.runInInjectionContext(() => {
      authInterceptor(req, next).subscribe({
        next: (res) => {
          capturedRes = res;
        },
      });
    });

    expect(capturedRes.body).toEqual({ data: 'test' });
  });

  it('9. should handle undefined token gracefully', () => {
    oauthServiceMock.getAccessToken.mockReturnValue(undefined);

    const req = new HttpRequest('GET', '/api/test');
    let capturedReq: HttpRequest<any> | null = null;
    const next: HttpHandlerFn = (clonedReq) => {
      capturedReq = clonedReq;
      return of(new HttpResponse({ status: 200 }));
    };

    TestBed.runInInjectionContext(() => {
      authInterceptor(req, next).subscribe();
    });

    expect(capturedReq!.headers.has('Authorization')).toBe(false);
  });

  it('10. should handle non-HttpErrorResponse exceptions gracefully', () => {
    oauthServiceMock.getAccessToken.mockReturnValue('valid-token');

    const req = new HttpRequest('GET', '/api/test');
    const genericError = new Error('Network failure');
    const next: HttpHandlerFn = () => throwError(() => genericError);

    let capturedError: any = null;
    TestBed.runInInjectionContext(() => {
      authInterceptor(req, next).subscribe({
        error: (err) => {
          capturedError = err;
        },
      });
    });

    expect(capturedError.message).toBe('Network failure');
    expect(oauthServiceMock.initCodeFlow).not.toHaveBeenCalled();
  });
});
