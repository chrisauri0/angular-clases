import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, InputTextModule, PasswordModule, ButtonModule, CardModule, CheckboxModule, CommonModule, MessageModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {


  registerForm: FormGroup;
  loading = false;

  constructor(private fb: FormBuilder) {
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
    // Guardar usuario en localStorage
    const userData = { ...this.registerForm.value };
    delete userData.confirmPassword;
    localStorage.setItem('user', JSON.stringify(userData));
    setTimeout(() => {
      this.loading = false;
      alert('Registro exitoso');
      this.registerForm.reset();
    }, 1200);
  }

}
