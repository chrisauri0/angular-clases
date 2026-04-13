import { Component, inject, OnInit } from '@angular/core';
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
import { API_BASE_URL_users } from '../../services/api.config';

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
export class Usuarios implements OnInit {



  userForm: FormGroup;
nombre: string = "";
email: string = "";
password: string = "";
direccion: string = "123 Main St";
loading = false;



  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  private messageService = inject(MessageService);

  ngOnInit(): void {
    this.hydrateCurrentUser();
  }

  private hydrateCurrentUser(): void {
    try {
      const rawUser = localStorage.getItem('user');
      if (!rawUser) return;

      const user = JSON.parse(rawUser);
      this.nombre = user?.name || '';
      this.email = user?.email || '';
    } catch {
      // Ignorar si localStorage no tiene formato esperado.
    }
  }

  private getCurrentUserId(): string | null {
    try {
      const rawUser = localStorage.getItem('user');
      if (!rawUser) return null;
      const user = JSON.parse(rawUser);
      return user?.id ?? null;
    } catch {
      return null;
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('token');
    const userId = this.getCurrentUserId();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (userId) headers['x-user-id'] = userId;

    return headers;
  }

  async saveProfile() {
    const userId = this.getCurrentUserId();
    if (!userId) {
      this.messageService.add({ severity: 'error', summary: 'Sesion', detail: 'No se encontró el usuario autenticado' });
      return;
    }

    const payload: Record<string, string> = {};

    const trimmedName = this.nombre.trim();
    const trimmedEmail = this.email.trim();
    const trimmedPassword = this.password.trim();

    if (trimmedName) payload['name'] = trimmedName;
    if (trimmedEmail) payload['email'] = trimmedEmail;
    if (trimmedPassword) payload['password'] = trimmedPassword;

    if (Object.keys(payload).length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Datos', detail: 'No hay cambios para guardar' });
      return;
    }

    this.loading = true;

    try {
      const response = await fetch(`${API_BASE_URL_users}/users/${userId}`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (response.status === 409) {
        this.messageService.add({ severity: 'warn', summary: 'Correo existente', detail: 'El email ya está registrado en otro usuario' });
        return;
      }

      if (response.status === 404) {
        this.messageService.add({ severity: 'error', summary: 'No encontrado', detail: 'El usuario no existe en el backend' });
        return;
      }

      if (!response.ok) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: `No se pudo guardar (${response.status})` });
        return;
      }

      const json = await response.json();
      const updatedUser = json?.data ?? json;

      const currentRaw = localStorage.getItem('user');
      const current = currentRaw ? JSON.parse(currentRaw) : {};
      localStorage.setItem('user', JSON.stringify({ ...current, ...updatedUser }));

      this.password = '';
      this.messageService.add({ severity: 'success', summary: 'Perfil actualizado', detail: 'Los datos se guardaron correctamente' });
    } catch {
      this.messageService.add({ severity: 'error', summary: 'Conexion', detail: 'Error de conexión al guardar cambios' });
    } finally {
      this.loading = false;
    }
  }



}
