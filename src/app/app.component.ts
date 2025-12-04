// src/app/app.component.ts
import { Component } from '@angular/core';
import { MsalSyncComponent } from './shared/components/auth/msal-sync.component';
import { HeaderComponent } from './shared/components/Header/header.Component';
import { SlideBar } from './shared/components/slide-bar/slide-bar';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [MsalSyncComponent, HeaderComponent, SlideBar],
})
export class AppComponent {}