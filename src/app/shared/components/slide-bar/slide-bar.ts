import { Component, HostListener, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-slide-bar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './slide-bar.html',
  styleUrls: ['./slide-bar.css'],
})
export class SlideBar implements OnInit {
  @Input() links: Array<{ label: string; route: string }> = [];
  userTypes = [
    { label: 'Cliente', value: 'client' },
    { label: 'Restaurante', value: 'restaurant' },
    { label: 'Administrador', value: 'admin' },
    { label: 'Conductor', value: 'driver' }
  ];
  selectedUserType: string | null = null;
  isOpen = false; // Cerrado por defecto
  isMobile = false;
  private wasMobile = false;
  activeSection = 'inicio'; // Sección activa por defecto

  @Output() sidebarStateChange = new EventEmitter<{ isOpen: boolean; isMobile: boolean }>();

  constructor(public themeService: ThemeService, private router: Router) {}

  ngOnInit(): void {
    this.checkScreenSize();
    this.wasMobile = this.isMobile;
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    const currentIsMobile = window.innerWidth < 768;

    // Solo cambiar el estado si realmente cambió el modo (mobile <-> desktop)
    if (currentIsMobile !== this.wasMobile) {
      this.isMobile = currentIsMobile;

      // Cerrado por defecto en ambos modos
      this.isOpen = false;

      this.wasMobile = this.isMobile;
      this.emitState();
    } else {
      // Solo actualizar la variable sin cambiar isOpen
      this.isMobile = currentIsMobile;
    }
  }

  toggle(): void {
    console.log('Toggle clicked - Before:', { isOpen: this.isOpen, isMobile: this.isMobile });
    this.isOpen = !this.isOpen;
    console.log('Toggle clicked - After:', { isOpen: this.isOpen, isMobile: this.isMobile });
    this.emitState();
  }

  close(): void {
    // Always close the sidebar when this is called (overlay click, menu selection)
    console.log('Close clicked (force):', { isOpen: this.isOpen, isMobile: this.isMobile });
    if (this.isOpen) {
      this.isOpen = false;
      this.emitState();
    }
  }

  setActiveSection(section: string): void {
    this.activeSection = section;
    if (section !== 'clientes') {
      this.close();
    }
  }

  selectUserType(type: string): void {
    this.selectedUserType = type;
    if (type === 'client') {
      this.links = [
        { label: 'Inicio', route: '/dashboard/client' },
        { label: 'Pedidos', route: '/dashboard/client/orders' },
        { label: 'Carrito', route: '/dashboard/client/cart' },
        { label: 'Perfil', route: '/dashboard/client/profile' }
      ];
      this.router.navigate(['/dashboard/client']).catch(err => console.warn('navigate error', err));
    } else if (type === 'restaurant') {
      this.links = [
        { label: 'Inicio', route: '/dashboard/restaurant' },
        { label: 'Pedidos', route: '/dashboard/restaurant/orders' },
        { label: 'Menú', route: '/dashboard/restaurant/menu' },
        { label: 'Graficas', route: '/dashboard/restaurant/charts' }
      ];
      this.router.navigate(['/dashboard/restaurant']).catch(err => console.warn('navigate error', err));
    } else if (type === 'admin') {
      this.links = [
        { label: 'Restaurantes', route: '/dashboard/admin/restaurants' },
        { label: 'Clientes', route: '/dashboard/admin/customers' },
        { label: 'Motos', route: '/dashboard/admin/motorcycles' },
        { label: 'Pedidos', route: '/dashboard/admin/orders' },
        { label: 'Incidencias', route: '/dashboard/admin/issues' }
      ];
      this.router.navigate(['/dashboard/admin']).catch(err => console.warn('navigate error', err));
    } else if (type === 'driver') {
      this.links = [
        { label: 'Inicio', route: '/dashboard/driver' },
        { label: 'Pedidos', route: '/dashboard/driver/orders' },
        { label: 'Mi Moto', route: '/dashboard/driver/moto' },
        { label: 'Perfil', route: '/dashboard/driver/profile' }
      ];
      this.router.navigate(['/dashboard/driver']).catch(err => console.warn('navigate error', err));
    }
    // Links and navigation for all user types handled above
  }

  private emitState(): void {
    this.sidebarStateChange.emit({ isOpen: this.isOpen, isMobile: this.isMobile });
  }

  // Volver al inicio del sidebar: mostrar selector de tipo de usuario
  resetSidebar(): void {
    this.selectedUserType = null;
    this.links = [];
    this.activeSection = 'inicio';
    this.isOpen = true; // mantener abierto para elegir
    this.emitState();
  }
}