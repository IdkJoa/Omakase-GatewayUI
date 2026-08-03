import { AuthConfig } from "angular-oauth2-oidc";
import { environment } from "../../../../environments/environment";

export const authConfig: AuthConfig = {
      issuer: environment.auth.issuer,
      redirectUri: environment.auth.redirectUri,
      clientId: environment.auth.clientId,
      responseType: 'code',
      scope: environment.auth.scope,
      showDebugInformation: environment.auth.showDebugInformation,
      requireHttps: environment.auth.requireHttps,
    };
