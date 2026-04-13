import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth-service';
import { ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, InputTextModule, PasswordModule, ButtonModule, CardModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
loginForm: FormGroup;
  loading = false;

  constructor(private fb: FormBuilder, private routerService: Router, private authService: AuthService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

 async onSubmit() {
  if (this.loginForm.invalid) {
    this.loginForm.markAllAsTouched();
    return;
  }

  this.loading = true;

  const emailInput = this.loginForm.value.email;
  const passwordInput = this.loginForm.value.password;

  const success = await this.authService.login(emailInput, passwordInput);

  if (success) {
    this.routerService.navigate(['/home']);
  } else {
      alert('Correo o contraseña incorrectos');
  }

  this.loading = false;
}
}
