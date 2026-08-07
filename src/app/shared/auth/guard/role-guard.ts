import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../auth.service';
import { inject } from '@angular/core';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService && typeof authService.hasRole === 'function') {
      const hasPermission = allowedRoles.some((role) => authService.hasRole(role));
      if (hasPermission) {
        return true;
      }
      router.navigate(['/dashboard']); 
      
      return false;
    }

    const claims = authService?.identityClaims as any;
    const userRoles: string[] = (claims?.realm_access?.roles || []).map((r: string) =>
      r.toUpperCase(),
    );
    const allowedNormalized = allowedRoles.map((r) => r.toUpperCase());

    const hasPermission = allowedNormalized.some((role) => userRoles.includes(role));
    if (hasPermission) {
      return true;
    }

    router.navigate(['/dashboard']);
    return false;
  };
};
