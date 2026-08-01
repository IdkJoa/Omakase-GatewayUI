import { authConfig } from './data/auth.data';
import { Injectable } from '@angular/core';
<<<<<<< Updated upstream
import { AuthConfig, OAuthService, OAuthErrorEvent } from 'angular-oauth2-oidc';
=======
import { OAuthService } from 'angular-oauth2-oidc';
>>>>>>> Stashed changes


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private oauthService: OAuthService) {}

  public initializeAuth(): Promise<void> {
    this.oauthService.configure(authConfig);
    this.oauthService.setupAutomaticSilentRefresh();
    (window as any).oauthService = this.oauthService;

    
    this.oauthService.events.subscribe((event) => {
      if (event instanceof OAuthErrorEvent) {
        if (event.type === 'invalid_nonce_in_state' || event.type === 'token_error') {
          console.warn('[Auth] Estado de sesión corrupto detectado. Limpiando y reiniciando...', event.type);
          this.clearAndRestartFlow();
        }
      }
    });

    return this.oauthService.loadDiscoveryDocumentAndLogin().then(() => {
      if (this.oauthService.hasValidAccessToken()) {
        console.log('Successfully logged in');
      } else {
        console.log('Not logged in, initiating login...');
        this.oauthService.initCodeFlow();
      }
    }).catch((error) => {
      console.warn('[Auth] Error al cargar discovery document. Limpiando estado...', error);
      this.clearAndRestartFlow();
    });
  }

  private clearAndRestartFlow(): void {
    const keysToRemove = Object.keys(sessionStorage).filter(
      (key) =>
        key.startsWith('oidc.') ||
        key.includes('access_token') ||
        key.includes('id_token') ||
        key.includes('nonce') ||
        key.includes('state') ||
        key.includes('PKCE')
    );
    keysToRemove.forEach((key) => sessionStorage.removeItem(key));

    console.log('[Auth] sessionStorage limpiado. Redirigiendo a login...');
    setTimeout(() => {
      this.oauthService.initCodeFlow();
    }, 100);
  }

  public get token() {
    return this.oauthService.getAccessToken();
  }

  public get identityClaims() {
    return this.oauthService.getIdentityClaims();
  }

  public logout() {
    this.oauthService.logOut();
  }
}
