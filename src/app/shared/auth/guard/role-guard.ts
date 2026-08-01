import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../auth.service';
import { inject } from '@angular/core';

 export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
      return () => {
        const authService = inject(AuthService);
        const router = inject(Router);

        const claims = authService.identityClaims as any;
        const userRoles: string[] = claims?.realm_access?.roles || [];

        const hasPermission = allowedRoles.some(role => userRoles.includes(role));
        if (hasPermission) {
          return true;
        }

        router.navigate(['/dashboard']);
        return false;
      };
    };
