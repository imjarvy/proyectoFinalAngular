import { Component, signal, ViewChild } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { Router, RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { SlideBar } from './shared/components/slide-bar/slide-bar';
import { HeaderComponent } from './shared/components/Header/header.Component';
import { FloatingChatComponent } from './shared/components/floating-chat/floating-chat';
import { MapConsumerComponent } from './shared/components/map-consumer/map-consumer.component';
import { ClientLayoutComponent } from './core/layouts/client-layout.component';
import { MsalSyncComponent } from './shared/components/auth/msal-sync.component';
import { NotificationCenterComponent } from './shared/components/notifications/notification-center.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SlideBar, HeaderComponent, FloatingChatComponent, MapConsumerComponent, HttpClientModule, MsalSyncComponent, NgIf, NotificationCenterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Plataforma de Domicilios');
  
  @ViewChild(SlideBar) slideBar!: SlideBar;
  
  sidebarOpen = false; // Cerrado por defecto
  sidebarMobile = false;

  constructor(private router: Router) {}

  onSidebarStateChange(state: { isOpen: boolean; isMobile: boolean }): void {
    this.sidebarOpen = state.isOpen;
    this.sidebarMobile = state.isMobile;
  }

  toggleSidebar(): void {
    if (this.slideBar) {
      this.slideBar.toggle();
    }
  }

  goToHome(): void {
    // Activate the "inicio" section in the sidebar
    if (this.slideBar) {
      this.slideBar.setActiveSection('inicio');
    }
  }

  get isAuthRoute(): boolean {
    return this.router.url.startsWith('/auth');
  }

  get showMap(): boolean {
    const url = this.router.url;
    return url === '/dashboard/client/cart' || url === '/dashboard/maps';
  }
}
