import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignInComponent } from '../../shared/components/auth/sign-in.component';

@Component({
  standalone: true,
  selector: 'app-auth-layout',
  imports: [CommonModule, SignInComponent],
  templateUrl: './auth-layout.component.html',
  styleUrls: ['./auth-layout.component.css'],
})
export class AuthLayoutComponent {}