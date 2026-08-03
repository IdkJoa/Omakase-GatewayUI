import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { roleGuard } from './role-guard';
import { AuthService } from '../auth.service';
import { vi } from 'vitest';

describe('roleGuard', () => {
  let authServiceMock: any;
  let routerMock: any;

  beforeEach(() => {
    authServiceMock = {
      identityClaims: {
        realm_access: { roles: ['ADMIN'] }
      },
      hasRole: vi.fn((role: string) => {
        const claims = authServiceMock.identityClaims as any;
        const roles: string[] = (claims?.realm_access?.roles || []).map((r: string) => r.toUpperCase());
        return roles.includes(role.toUpperCase());
      })
    };

    routerMock = {
      navigate: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    });
  });

  it('1. should allow access if user has allowed role (ADMIN)', () => {
    const guardFn = roleGuard(['ADMIN']);
    const result = TestBed.runInInjectionContext(() => guardFn({} as any, {} as any));
    expect(result).toBe(true);
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('2. should allow access when role case differs (admin vs ADMIN)', () => {
    const guardFn = roleGuard(['admin']);
    const result = TestBed.runInInjectionContext(() => guardFn({} as any, {} as any));
    expect(result).toBe(true);
  });

  it('3. should deny access and navigate to dashboard if user lacks role', () => {
    authServiceMock.identityClaims = { realm_access: { roles: ['VIEWER'] } };
    const guardFn = roleGuard(['ADMIN']);
    const result = TestBed.runInInjectionContext(() => guardFn({} as any, {} as any));
    expect(result).toBe(false);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('4. should handle null identityClaims without throwing error', () => {
    authServiceMock.identityClaims = null;
    const guardFn = roleGuard(['ADMIN']);
    const result = TestBed.runInInjectionContext(() => guardFn({} as any, {} as any));
    expect(result).toBe(false);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('5. should handle missing realm_access in identityClaims safely', () => {
    authServiceMock.identityClaims = {};
    const guardFn = roleGuard(['ADMIN']);
    const result = TestBed.runInInjectionContext(() => guardFn({} as any, {} as any));
    expect(result).toBe(false);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('6. should allow access if user has any one of multiple allowed roles', () => {
    authServiceMock.identityClaims = { realm_access: { roles: ['OPERATOR'] } };
    const guardFn = roleGuard(['ADMIN', 'OPERATOR', 'AUDITOR']);
    const result = TestBed.runInInjectionContext(() => guardFn({} as any, {} as any));
    expect(result).toBe(true);
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('7. should handle empty allowedRoles list gracefully and reject access', () => {
    const guardFn = roleGuard([]);
    const result = TestBed.runInInjectionContext(() => guardFn({} as any, {} as any));
    expect(result).toBe(false);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('8. should handle empty user roles list gracefully', () => {
    authServiceMock.identityClaims = { realm_access: { roles: [] } };
    const guardFn = roleGuard(['ADMIN']);
    const result = TestBed.runInInjectionContext(() => guardFn({} as any, {} as any));
    expect(result).toBe(false);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('9. should handle undefined identityClaims safely', () => {
    authServiceMock.identityClaims = undefined;
    const guardFn = roleGuard(['ADMIN']);
    const result = TestBed.runInInjectionContext(() => guardFn({} as any, {} as any));
    expect(result).toBe(false);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('10. should ensure guard returns a boolean value', () => {
    const guardFn = roleGuard(['ADMIN']);
    const result = TestBed.runInInjectionContext(() => guardFn({} as any, {} as any));
    expect(typeof result).toBe('boolean');
  });
});
