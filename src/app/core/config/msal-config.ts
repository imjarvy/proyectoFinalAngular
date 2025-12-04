/**
 * Configuración de MSAL para Angular.
 * Reemplaza 'TU_CLIENT_ID' por tu ClientId de Azure AD.
 * Reemplaza 'TU_TENANT_ID' si usas tenant específico.
 */
export const msalConfig = {
  auth: {
    clientId: 'TU_CLIENT_ID', // <-- REEMPLAZA AQUÍ
    authority: 'https://login.microsoftonline.com/common', // o tu tenant
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ['User.Read'],
};

export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
  graphMePhotoEndpoint: 'https://graph.microsoft.com/v1.0/me/photo/$value',
};