import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { PermisoAdmin } from '../../directives/permisos.model';

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [TableModule, TagModule, CommonModule, ButtonModule, DialogModule, InputTextModule, MultiSelectModule, FormsModule],
  templateUrl: './gestion-usuarios.html',

  styleUrl: './gestion-usuarios.scss',
})
export class GestionUsuarios {
  usuarios: any[];
  mostrarEditarUsuario = false;
  usuarioSeleccionado: any = null;
  permisosDisponibles = PermisoAdmin;

  constructor() {
    this.usuarios = [
      { id: 1, nombre: 'Juan Pérez', email: 'juan.perez@example.com', permisos: [] },
      { id: 2, nombre: 'María Gómez', email: 'maria.gomez@example.com', permisos: [] }
    ];
  }

  abrirEditarUsuario(usuario: any) {
    // Clonamos el usuario para no modificar el array original hasta guardar
    this.usuarioSeleccionado = { ...usuario };
    this.mostrarEditarUsuario = true;
  }

  guardarUsuarioEditado() {
    if (this.usuarioSeleccionado) {
      const idx = this.usuarios.findIndex(u => u.id === this.usuarioSeleccionado.id);
      if (idx !== -1) {
        this.usuarios[idx] = { ...this.usuarioSeleccionado };
      }
      this.mostrarEditarUsuario = false;
      this.usuarioSeleccionado = null;
    }
  }
}
