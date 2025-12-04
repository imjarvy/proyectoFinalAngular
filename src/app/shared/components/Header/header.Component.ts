import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UserAvatarComponent } from './user.Avatar.Component';
import { AuthService } from '../../../core/services/auth.service';
import { UserStorageManager } from '../../../core/utils/storage-manager';

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

  photoURL = '';
  userName = '';
  userEmail = '';
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

  ngOnInit() {
    // Inicializar datos del usuario desde el storage unificado
    const user = UserStorageManager.getUser();
    if (user) {
      this.photoURL = (user as any).photoURL || '';
      this.userName = (user as any).displayName || (user as any).name || '';
      this.userEmail = user.email || '';
    }

    // Suscribirse al observable de usuario por si cambia en runtime
    this.authService.user$.subscribe(u => {
      if (!u) {
        this.photoURL = '';
        this.userName = '';
        this.userEmail = '';
        return;
      }
      this.photoURL = (u as any).photoURL || '';
      this.userName = (u as any).displayName || (u as any).name || '';
      this.userEmail = u.email || '';
    });
  }

  async logout() {
    this.showProfileMenu = false;
    try {
      await this.authService.signOut();
    } catch (e) {
      console.error('Error en logout global:', e);
    }
    // Limpiar datos locales
    this.photoURL = '';
    this.userName = '';
    this.userEmail = '';
    this.router.navigate(['/auth/signin']);
  }
}