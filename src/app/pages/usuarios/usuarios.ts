import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';


import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { HasPermissionDirective } from "../../directives/has-permission.directive";
import { GestionUsuarios } from '../gestion-usuarios/gestion-usuarios';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    CardModule,
    FormsModule,
    FloatLabelModule,
    ToastModule,
    HasPermissionDirective,
    GestionUsuarios,
],
  providers: [MessageService],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss',
})
export class Usuarios {



  userForm: FormGroup;
nombre: string = "admin";
email: string = "admin@example.com";
password: string = "admin123";
direccion: string = "123 Main St";



  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  private messageService = inject(MessageService);


  showSuccess() {
          this.messageService.add({severity:'success', summary: 'Success', detail: 'Message Content'});
      }

  

  

}
