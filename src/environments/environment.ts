export const environment = {
  // Indica si es build de producción
  production: false,

  // Base API urls usadas por los servicios core.
  // Equivalentes a VITE_API_URL y VITE_API_URL_MOCK de tu proyecto React.
  apiBase: 'http://127.0.0.1:5000',
  apiBaseMock: 'https://6bda867e-bfca-41a6-9cd7-8578ae87e317.mock.pstmn.io',

  // ========================================
  // MICROSOFT OAUTH CONFIGURATION
  // ========================================

  // Equivalentes a VITE_MICROSOFT_* del proyecto React.
  microsoft: {
    clientId: 'e928a93a-2705-49d4-b218-b2ef443c6628',
    tenantId: '6cea39d3-d922-4122-90b8-4e7cf0d07b3d',
    // Redirect URI para SPA (debe coincidir EXACTAMENTE con Azure)
    redirectUri: 'http://localhost:5173/auth/callback',
    authority: 'https://login.microsoftonline.com/common',
    logoutUri: 'http://localhost:5173',
  },

  // ========================================
  // FIREBASE CONFIG PLACEHOLDERS
  // ========================================

  firebase: {
    apiKey: "AIzaSyDJKsMY5u1CuuEd1MfXlgLH8eLX9hQ7xOM",
    authDomain: "proyectoreact-e6288.firebaseapp.com",
    projectId: "proyectoreact-e6288",
    storageBucket: "proyectoreact-e6288.firebasestorage.app",
    messagingSenderId: "592240659081",
    appId: "1:592240659081:web:15e9caffefffcb986f9458"
},
};
