import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UserAvatarComponent } from './user.Avatar.Component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-header',
  templateUrl: './header.Component.html',
  styleUrls: ['./header.Component.css'],
  imports: [
    CommonModule,
    UserAvatarComponent,
    RouterModule
  ]
})

export class HeaderComponent {
  @Input() isMobile: boolean = false;
  @Input() sidebarOpen: boolean = true;
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() goToHome = new EventEmitter<void>();

  photoURL = localStorage.getItem('photoURL') || '';
  showProfileMenu = false;

  constructor(private router: Router, private authService: AuthService) {}

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  goHome() {
    // Emit event to parent to activate "inicio" section
    this.goToHome.emit();
  }

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
  }

  async logout() {
    this.showProfileMenu = false;
    try {
      await this.authService.signOut();
    } catch (e) {
      console.error('Error en logout global:', e);
    }
    // Actualizar avatar por si dependía de localStorage
    this.photoURL = '';
    this.router.navigate(['/auth/signin']);
  }
}