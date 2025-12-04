import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MsalService } from '@azure/msal-angular';
import { MicrosoftLoginButtonComponent } from './microsoft-login-button.component';
import { MicrosoftUserProfileComponent } from './user-profile.component';

@Component({
  standalone: true,
  selector: 'app-microsoft-auth-page',
  imports: [CommonModule, MicrosoftLoginButtonComponent, MicrosoftUserProfileComponent],
  templateUrl: './microsoft-auth-page.component.html',
  styleUrls: ['./microsoft-auth-page.component.css'],
})
export class MicrosoftAuthPageComponent {
  private accountsSignal = signal<any[]>([]);

  isAuthenticated = computed(() => this.accountsSignal().length > 0);
  accountsCount = computed(() => this.accountsSignal().length);

  firstAccountName = computed(() => this.accountsSignal()[0]?.name ?? '');
  firstAccountUsername = computed(() => this.accountsSignal()[0]?.username ?? '');
  accountType = computed(() => {
    const tid = (this.accountsSignal()[0]?.idTokenClaims as any)?.['tid'];
    return tid ? 'Azure AD' : 'Personal';
  });

  constructor(private msalService: MsalService) {
    this.accountsSignal.set(this.msalService.instance.getAllAccounts());
  }
}
