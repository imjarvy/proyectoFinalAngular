// src/app/app.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false, // fuerza a Angular a tratarlo como NO standalone
})
export class AppComponent {}