// src/app/app.component.ts
import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { MsalSyncComponent } from './shared/components/auth/msal-sync.component';
import { HeaderComponent } from './shared/components/Header/header.Component';
import { SlideBar } from './shared/components/slide-bar/slide-bar';
import { NotificationCenterComponent } from './shared/components/notifications/notification-center.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [MsalSyncComponent, HeaderComponent, SlideBar, RouterOutlet, NgIf, NotificationCenterComponent],
})
export class AppComponent {
  constructor(private router: Router) {}

  get showMap(): boolean {
    const url = this.router.url;
    return url === '/dashboard/client/cart' || url === '/dashboard/maps';
  }

  get isAuthRoute(): boolean {
    return this.router.url.startsWith('/auth');
  }
}