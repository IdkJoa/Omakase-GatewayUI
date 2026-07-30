import { Injectable } from '@angular/core';
import { AuthConfig, OAuthService, OAuthErrorEvent } from 'angular-oauth2-oidc';

export const authConfig: AuthConfig = {
  //   // Url of the Identity Provider
  issuer: 'http://localhost:8080/realms/omakase-gateway',

  //   // URL of the SPA to redirect the user to after login
  redirectUri: window.location.origin,

  //   // The SPA's id. The SPA is registerd with this id at the auth-server
  clientId: 'omakase-dashboard',

  //   // Just needed if your auth server demands a secret. In general, this
  //   // is a sign that the auth server is not configured with SPAs in mind
  //   // and it might not enforce further best practices vital for security
  //   // such applications.
  //   // dummyClientSecret: 'secret',

  responseType: 'code',

  //   // set the scope for the permissions the client should request
  //   // The first four are defined by OIDC.
  //   // Important: Request offline_access to get a refresh token
  //   // The api scope is a usecase specific one
  scope: 'openid profile email',

  showDebugInformation: true,
  requireHttps: false, // important for local dev
};

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
