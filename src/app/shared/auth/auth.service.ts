// import { Injectable } from '@angular/core';
// import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';

// export const authConfig: AuthConfig = {
//   // Url of the Identity Provider
//   issuer: 'http://localhost:8080/realms/omakase-gateway',

//   // URL of the SPA to redirect the user to after login
//   redirectUri: window.location.origin,

//   // The SPA's id. The SPA is registerd with this id at the auth-server
//   clientId: 'omakase-dashboard',

//   // Just needed if your auth server demands a secret. In general, this
//   // is a sign that the auth server is not configured with SPAs in mind
//   // and it might not enforce further best practices vital for security
//   // such applications.
//   // dummyClientSecret: 'secret',

//   responseType: 'code',

//   // set the scope for the permissions the client should request
//   // The first four are defined by OIDC.
//   // Important: Request offline_access to get a refresh token
//   // The api scope is a usecase specific one
//   scope: 'openid profile email',

//   showDebugInformation: true,
//   requireHttps: false // important for local dev
// };

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {
//   constructor(private oauthService: OAuthService) {}

//   public initializeAuth(): Promise<void> {
//     this.oauthService.configure(authConfig);
//     this.oauthService.setupAutomaticSilentRefresh();

//     return this.oauthService.loadDiscoveryDocumentAndLogin().then(() => {
//         if (this.oauthService.hasValidAccessToken()) {
//             console.log('Successfully logged in');
//         } else {
//             console.log('Not logged in, initiating login...');
//             this.oauthService.initCodeFlow();
//         }
//     });
//   }

//   public get token() {
//     return this.oauthService.getAccessToken();
//   }

//   public get identityClaims() {
//     return this.oauthService.getIdentityClaims();
//   }

//   public logout() {
//     this.oauthService.logOut();
//   }
// }
