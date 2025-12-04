import type { Configuration } from '@azure/msal-browser';
import { environment } from '../../../environments/environment';

// Configuración MSAL basada en environment.microsoft (equivalente a VITE_MICROSOFT_* de React)
export const msalConfig: Configuration = {
  auth: {
    clientId: environment.microsoft.clientId,
    authority: environment.microsoft.authority,
    redirectUri: environment.microsoft.redirectUri,
    postLogoutRedirectUri: environment.microsoft.logoutUri,
  },
  cache: {
    cacheLocation: 'sessionStorage',
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