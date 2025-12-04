/**
 * Stub para integración con backend.
 * POST a `${environment.apiBase}/auth/microsoft` con normalizedUser.
 * Si falla, emite evento 'authStateChanged'.
 */
import { environment } from '../../../environments/environment';

const securityService = {
  async loginWithMicrosoft(normalizedUser: any): Promise<any> {
    try {
      const response = await fetch(`${environment.apiBase}/auth/microsoft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalizedUser),
      });
      if (!response.ok) throw new Error('Backend error');
      return await response.json();
    } catch (error) {
      window.dispatchEvent(
        new CustomEvent('authStateChanged', {
          detail: { user: normalizedUser, token: normalizedUser.token },
        })
      );
      throw error;
    }
  },
};

export default securityService;