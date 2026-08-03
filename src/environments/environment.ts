export const environment = {
  production: true,
  API_URL: 'http://localhost:5028/api/v1',
  auth: {
    issuer: 'http://localhost:8080/realms/omakase-gateway',
    redirectUri: typeof window !== 'undefined' ? window.location.origin : '',
    clientId: 'omakase-dashboard',
    scope: 'openid profile email',
    showDebugInformation: false, // 🔒 En producción NO se muestran logs de debug
    requireHttps: false, // 🔒 HTTPS obligatorio en producción
  },
};
