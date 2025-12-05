import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface AppNotification {
  message: string;
  type: 'success' | 'info' | 'error' | 'warning';
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notificationSubject = new Subject<AppNotification>();

  notifications$: Observable<AppNotification> = this.notificationSubject.asObservable();

  notify(notification: AppNotification): void {
    this.notificationSubject.next(notification);
  }
}
