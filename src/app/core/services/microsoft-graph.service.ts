/**
 * Servicio pequeño con helpers para llamar a Microsoft Graph.
 * Mantiene la misma lógica de los helpers en tu código React:
 * - callMsGraph(accessToken)
 * - getUserPhoto(accessToken)
 *
 * NOTA: usamos fetch como en el original para mantener comportamiento idéntico.
 */

import { Injectable } from '@angular/core';
import { graphConfig } from '../config/msal-config';

export interface MicrosoftUser {
  id: string;
  displayName: string;
  givenName: string;
  surname: string;
  userPrincipalName: string;
  mail: string;
  jobTitle?: string;
  officeLocation?: string;
  mobilePhone?: string;
  businessPhones?: string[];
}

@Injectable({ providedIn: 'root' })
export class MicrosoftGraphService {
  constructor() {}

  async callMsGraph(accessToken: string): Promise<MicrosoftUser> {
    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;
    headers.append('Authorization', bearer);

    const options: RequestInit = {
      method: 'GET',
      headers,
    };

    try {
      const response = await fetch(graphConfig.graphMeEndpoint, options);
      if (!response.ok) {
        throw new Error(`Error al obtener datos del usuario: ${response.statusText}`);
      }
      const data = await response.json();
      return data as MicrosoftUser;
    } catch (error) {
      console.error('Error al llamar a Microsoft Graph:', error);
      throw error;
    }
  }

  async getUserPhoto(accessToken: string): Promise<string | null> {
    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;
    headers.append('Authorization', bearer);

    const options: RequestInit = {
      method: 'GET',
      headers,
    };

    try {
      const response = await fetch(graphConfig.graphMePhotoEndpoint, options);
      if (!response.ok) {
        console.warn('No se pudo obtener la foto del usuario');
        return null;
      }
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      return imageUrl;
    } catch (error) {
      console.error('Error al obtener foto del usuario:', error);
      return null;
    }
  }
}