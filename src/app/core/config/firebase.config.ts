import { environment } from '../../../environments/environment';

/**
 * Helper para saber si Firebase está configurado de forma "real".
 * Usa los valores de `environment.firebase`.
 */
export function isFirebaseConfigured(): boolean {
  const fb = environment.firebase;
  return !!(fb && fb.apiKey && fb.apiKey !== 'TU_API_KEY');
}
