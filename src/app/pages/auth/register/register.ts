import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { API_BASE_URL_users } from '../../../services/api.config';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, InputTextModule, PasswordModule, ButtonModule, CardModule, CheckboxModule, MessageModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {


  registerForm: FormGroup;
  loading = false;

  constructor(private fb: FormBuilder, private router: Router) {
    this.registerForm = this.fb.group(
      {
        name: ['', Validators.required],
        fullName: ['', Validators.required],
        phone: [
          '',
          [
            Validators.required,
            Validators.pattern(/^[0-9]{10}$/)
          ]
        ],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [
          Validators.required,
          Validators.minLength(10),
          this.passwordComplexityValidator
        ]],
        confirmPassword: ['', Validators.required],
        address: ['', Validators.required],
        adult: [false, Validators.requiredTrue],
        terms: [false, Validators.requiredTrue]
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordComplexityValidator(control: AbstractControl) {
    const value = control.value || '';
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecial = /[!@#$%^&*()_+{}:\"?\[\];',./]/.test(value);
    if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      return { complexity: true };
    }
    return null;
  }
  passwordMatchValidator(form: AbstractControl) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    if (password !== confirmPassword) {
      return { mismatch: true };
    } else {
      return null;
    }
  }

  async onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const payload = {
      name: this.registerForm.value.name,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
    };

    try {
      const response = await fetch(`${API_BASE_URL_users}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        alert('No se pudo registrar el usuario');
        return;
      }

      alert('Registro exitoso');
      this.registerForm.reset();
      await this.router.navigate(['/login']);
      
    } catch (error) {
      alert('Error de conexion con el servidor');
    } finally {
      this.loading = false;
    }
  }

}
