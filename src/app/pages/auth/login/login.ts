import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, InputTextModule, PasswordModule, ButtonModule, CardModule, CommonModule, ],
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

  constructor(private fb: FormBuilder, private routerService: Router) {
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

    const isEmailMatch = emailInput === this.userFake.email;
    const isPasswordMatch = passwordInput === this.userFake.password;

    if (isEmailMatch && isPasswordMatch) {
      this.routerService.navigate(['/home']); // mejor que window.location
    } 
    else if (!isEmailMatch && !isPasswordMatch) {
      alert('Correo y contraseña incorrectos');
    } 
    else if (!isEmailMatch) {
      alert('Correo incorrecto');
    } 
    else if (!isPasswordMatch) {
      alert('Contraseña incorrecta');
    }

    this.loading = false;
  }, 1500);
}
}
