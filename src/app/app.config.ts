import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  APP_INITIALIZER,
  provideAppInitializer,
  inject,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { provideOAuthClient } from 'angular-oauth2-oidc';
import { authInterceptor } from './shared/auth/auth.interceptor';
import { AuthService } from './shared/auth/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideOAuthClient(),
    provideAppInitializer(() => {
      const authService = inject(AuthService);
      return authService.initializeAuth();
    }),
    providePrimeNG({
      theme: {
        preset: Aura,
      },
    }),
  ],
};
