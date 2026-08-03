import { authConfig } from './data/auth.data';
import { Injectable } from '@angular/core';
import { OAuthService, OAuthErrorEvent } from 'angular-oauth2-oidc';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private oauthService: OAuthService) {}

  public initializeAuth(): Promise<void> {
    this.oauthService.configure(authConfig);
    this.oauthService.setupAutomaticSilentRefresh();

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

  private get decodedAccessToken(): any {
    const token = this.token;
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  public get userRoles(): string[] {
    const idClaims = (this.identityClaims as any) || {};
    const accessClaims = this.decodedAccessToken || {};

    const idRoles: string[] = idClaims?.realm_access?.roles || [];
    const accessRoles: string[] = accessClaims?.realm_access?.roles || [];

    const resourceAccess = accessClaims?.resource_access || idClaims?.resource_access || {};
    const clientRoles: string[] = Object.values(resourceAccess).flatMap(
      (client: any) => client?.roles || []
    );

    const allRoles = [...idRoles, ...accessRoles, ...clientRoles];
    return Array.from(new Set(allRoles.map((r: string) => r.toUpperCase())));
  }

  public logout() {
    this.oauthService.logOut();
  }

  public hasRole(role: string): boolean {
    return this.userRoles.includes(role.toUpperCase());
  }

  public get isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  public get isViewer(): boolean {
    return this.hasRole('VIEWER') || !this.isAdmin;
  }
}
