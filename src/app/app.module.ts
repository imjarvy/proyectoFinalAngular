/**
 * AppModule: registra MSAL y HttpClientModule.
 * Inicializa Firebase SDK directo (window.__FIREBASE_CONFIG__).
 * Reemplaza CLIENT_ID y firebase config en environment.ts.
 */
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { MsalModule, MsalService, MsalBroadcastService, MsalGuard, MSAL_INSTANCE } from '@azure/msal-angular';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from './core/config/msal-config';

export function MSALInstanceFactory() {
  return new PublicClientApplication(msalConfig);
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    MsalModule,
    // Importa aquí tus componentes standalone si los usas en rutas
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
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor() {
    // Inicializa Firebase config global para servicios
    // (si usas AngularFire, registra el módulo y elimina esto)
    // @ts-ignore
    window.__FIREBASE_CONFIG__ = require('../environments/environment').environment.firebase;
  }
}