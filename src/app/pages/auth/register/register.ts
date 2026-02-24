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
        password: ['', [Validators.required, Validators.minLength(6), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}:"?[\];',./]).{10,}$/)]],
        confirmPassword: ['', Validators.required],
        address: ['', Validators.required],
        adult: [false, Validators.requiredTrue],
        terms: [false, Validators.requiredTrue]
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(form: AbstractControl) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ mismatch: true });
    } else {
      form.get('confirmPassword')?.setErrors(null);
    }
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    // Simulación de registro
    setTimeout(() => {
      console.log('Usuario registrado:', this.registerForm.value);
      this.loading = false;
    }, 1500);
  }

}
