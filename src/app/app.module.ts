/**
 * AppModule: registra MSAL y HttpClientModule.
 * Inicializa Firebase SDK directo (window.__FIREBASE_CONFIG__).
 * Reemplaza CLIENT_ID y firebase config en environment.ts.
 */
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { MsalModule, MsalService, MsalBroadcastService, MsalGuard, MSAL_INSTANCE } from '@azure/msal-angular';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from './core/config/msal-config';

export function MSALInstanceFactory() {
  return new PublicClientApplication(msalConfig);
}

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    HttpClientModule,
    MsalModule,
    // AppComponent es standalone, se bootstrapea directamente
  ],
  providers: [
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory,
    },
    MsalService,
    MsalBroadcastService,
    MsalGuard,
  ],
  bootstrap: [],
})
export class AppModule {
  constructor() {
    // Inicializa Firebase config global para servicios
    // (si usas AngularFire, registra el módulo y elimina esto)
    // @ts-ignore
    window.__FIREBASE_CONFIG__ = require('../environments/environment').environment.firebase;
  }
}