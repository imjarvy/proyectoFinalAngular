import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { NotificationService, AppNotification } from '../../../core/services/notification.service';

interface UiNotification extends AppNotification {
  id: number;
}

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-container">
      <div
        *ngFor="let n of notifications"
        class="notification"
        [ngClass]="'notification-' + n.type"
      >
        <span class="notification-message">{{ n.message }}</span>
        <button class="notification-close" (click)="dismiss(n.id)">&times;</button>
      </div>
    </div>
  `,
  styles: [
    `
      .notification-container {
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 1050;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        pointer-events: none;
      }

      .notification {
        min-width: 260px;
        max-width: 360px;
        padding: 0.75rem 1rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        pointer-events: auto;
        font-size: 0.9rem;
        animation: fadeIn 0.2s ease-out;
      }

      .notification-message {
        flex: 1;
      }

      .notification-close {
        background: transparent;
        border: none;
        color: inherit;
        font-size: 1.1rem;
        cursor: pointer;
      }

      .notification-success {
        background-color: #16a34a;
      }

      .notification-info {
        background-color: #0ea5e9;
      }

      .notification-error {
        background-color: #dc2626;
      }

      .notification-warning {
        background-color: #f59e0b;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class NotificationCenterComponent implements OnInit, OnDestroy {
  notifications: UiNotification[] = [];
  private sub?: Subscription;
  private idCounter = 0;
  private audio = new Audio('assets/notification.mp3');

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.sub = this.notificationService.notifications$.subscribe((n) => {
      const id = ++this.idCounter;
      const ui: UiNotification = { ...n, id };
      this.notifications = [...this.notifications, ui];

       this.playSound();

      // Auto-dismiss after 5 seconds
      timer(5000).subscribe(() => this.dismiss(id));
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  dismiss(id: number): void {
    this.notifications = this.notifications.filter((n) => n.id !== id);
  }

  private playSound(): void {
    try {
      this.audio.currentTime = 0;
      void this.audio.play();
    } catch {
      // Silenciar errores de reproducción (autoplay bloqueado, etc.)
    }
  }
}
