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

  userFake = {
    email: 'admin@uteq.edu.mx',
    password: 'admin123'
  };

  constructor(private fb: FormBuilder, private routerService: Router, private authService: AuthService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

 onSubmit() {
  if (this.loginForm.invalid) {
    this.loginForm.markAllAsTouched();
    return;
  }

  this.loading = true;

  setTimeout(() => {
    const emailInput = this.loginForm.value.email;
    const passwordInput = this.loginForm.value.password;

    const role = this.authService.login(emailInput, passwordInput);

    if (role === 'admin') {
      this.routerService.navigate(['/home']);
    } else if (role === 'user') {
      this.routerService.navigate(['/home']);
    } else {
      // Usuario o contraseña incorrectos
      alert('Correo o contraseña incorrectos');
    }

    this.loading = false;
  }, 1000);
}
}
