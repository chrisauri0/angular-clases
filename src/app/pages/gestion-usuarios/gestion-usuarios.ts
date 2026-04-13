import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { PermisoAdmin } from '../../directives/permisos.model';
import { API_BASE_URL_groups, API_BASE_URL_users } from '../../services/api.config';

interface UserDto {
  id: string;
  name: string;
  email: string;
  created_at?: string;
}

interface GroupDto {
  id: string;
  name: string;
  description?: string | null;
}

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  created_at?: string;
  permissions: string[];
}

interface UserGroupPermissionsRow {
  groupId: string;
  groupName: string;
  permissions: string[];
}

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [TableModule, TagModule, CommonModule, ButtonModule, DialogModule, InputTextModule, MultiSelectModule, SelectModule, FormsModule],
  templateUrl: './gestion-usuarios.html',

  styleUrl: './gestion-usuarios.scss',
})
export class GestionUsuarios implements OnInit {
  loading = false;
  errorMessage = '';
  successMessage = '';

  usuarios: ManagedUser[] = [];
  grupos: GroupDto[] = [];

  mostrarEditarUsuario = false;
  mostrarAsignarPermisos = false;

  usuarioSeleccionado: ManagedUser | null = null;
  usuarioPermisosSeleccionado: ManagedUser | null = null;

  gruposSeleccionadosIds: string[] = [];
  grupoVistaId: string | null = null;
  permisosSeleccionados: string[] = [];
  permisosActualesGrupo: string[] = [];
  userGroupPermissionsRows: UserGroupPermissionsRow[] = [];

  permisosDisponibles = PermisoAdmin;
  permissionOptions = PermisoAdmin.map((permiso) => ({ label: permiso, value: permiso }));

  get groupOptions() {
    return this.grupos.map((group) => ({ label: group.name, value: group.id }));
  }

  ngOnInit() {
    this.loadInitialData();
  }

  async loadInitialData() {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      await this.loadGroups();
      await this.loadUsers();
      await this.hydrateUsersPermissions();
    } finally {
      this.loading = false;
    }
  }

  async loadUsers() {
    try {
      const response = await fetch(`${API_BASE_URL_users}/users`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        this.errorMessage = `No se pudieron cargar usuarios (${response.status})`;
        return;
      }

      const json = await response.json();
      const users = this.extractApiData<UserDto[]>(json) || [];

      this.usuarios = users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
        permissions: [],
      }));
    } catch {
      this.errorMessage = 'Error de conexion al cargar usuarios.';
    }
  }

  async loadGroups() {
    try {
      const response = await fetch(`${API_BASE_URL_groups}/groups`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        return;
      }

      const json = await response.json();
      this.grupos = this.extractApiData<GroupDto[]>(json) || [];
    } catch {
      // Si falla grupos, aun se puede editar usuario.
    }
  }

  abrirEditarUsuario(usuario: ManagedUser) {
    this.usuarioSeleccionado = { ...usuario, permissions: [...usuario.permissions] };
    this.mostrarEditarUsuario = true;
  }

  async guardarUsuarioEditado() {
    if (!this.usuarioSeleccionado) return;

    this.errorMessage = '';
    this.successMessage = '';

    try {
      const response = await fetch(`${API_BASE_URL_users}/users/${this.usuarioSeleccionado.id}`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          name: this.usuarioSeleccionado.name?.trim(),
          email: this.usuarioSeleccionado.email?.trim(),
        }),
      });

      if (!response.ok) {
        this.errorMessage = `No se pudo actualizar el usuario (${response.status}). Si no existe PATCH /users/:id en backend, agregalo.`;
        return;
      }

      const updated = this.extractApiData<UserDto>(await response.json());
      const index = this.usuarios.findIndex((u) => u.id === this.usuarioSeleccionado?.id);
      if (index >= 0) {
        this.usuarios[index] = {
          ...this.usuarios[index],
          name: updated?.name || this.usuarioSeleccionado.name,
          email: updated?.email || this.usuarioSeleccionado.email,
        };
      }

      this.successMessage = 'Usuario actualizado correctamente.';
      this.mostrarEditarUsuario = false;
      this.usuarioSeleccionado = null;
    } catch {
      this.errorMessage = 'Error de conexion al actualizar usuario.';
    }
  }

  abrirAsignarPermisos(usuario: ManagedUser) {
    this.usuarioPermisosSeleccionado = usuario;
    this.gruposSeleccionadosIds = [];
    this.grupoVistaId = null;
    this.permisosSeleccionados = [];
    this.permisosActualesGrupo = [];
    this.userGroupPermissionsRows = [];
    this.mostrarAsignarPermisos = true;
    this.loadUserGroupPermissionsRows(usuario.id);
  }

  async onChangeGrupoPermisos() {
    if (!this.usuarioPermisosSeleccionado?.id || !this.grupoVistaId) {
      this.permisosActualesGrupo = [];
      this.permisosSeleccionados = [];
      return;
    }

    const permisos = await this.fetchPermissionsByGroupAndUser(this.grupoVistaId, this.usuarioPermisosSeleccionado.id);
    this.permisosActualesGrupo = permisos;
    this.permisosSeleccionados = [...permisos];
  }

  seleccionarGrupoParaEditar(groupId: string) {
    this.grupoVistaId = groupId;
    this.gruposSeleccionadosIds = [groupId];
    this.onChangeGrupoPermisos();
  }

  async guardarPermisosUsuario() {
    if (!this.usuarioPermisosSeleccionado?.id || this.gruposSeleccionadosIds.length === 0) {
      this.errorMessage = 'Selecciona al menos un grupo para asignar permisos.';
      return;
    }

    try {
      for (const groupId of this.gruposSeleccionadosIds) {
        const response = await fetch(`${API_BASE_URL_groups}/groups/${groupId}/members`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({
            userId: this.usuarioPermisosSeleccionado.id,
            permissions: this.permisosSeleccionados,
          }),
        });

        if (!response.ok) {
          this.errorMessage = `No se pudieron guardar permisos (${response.status}).`;
          return;
        }
      }

      this.successMessage = 'Permisos asignados correctamente en los grupos seleccionados.';

      const user = this.usuarios.find((u) => u.id === this.usuarioPermisosSeleccionado?.id);
      if (user) {
        user.permissions = await this.fetchAggregatedPermissionsForUser(user.id);
      }

      await this.loadUserGroupPermissionsRows(this.usuarioPermisosSeleccionado.id);
    } catch {
      this.errorMessage = 'Error de conexion al guardar permisos.';
    }
  }

  private async loadUserGroupPermissionsRows(userId: string) {
    if (!this.grupos.length) {
      this.userGroupPermissionsRows = [];
      return;
    }

    const rows = await Promise.all(
      this.grupos.map(async (group) => ({
        groupId: group.id,
        groupName: group.name,
        permissions: await this.fetchPermissionsByGroupAndUser(group.id, userId),
      }))
    );

    this.userGroupPermissionsRows = rows.filter((row) => row.permissions.length > 0);
  }

  private async hydrateUsersPermissions() {
    if (!this.grupos.length || !this.usuarios.length) return;

    const hydratedUsers = await Promise.all(
      this.usuarios.map(async (user) => ({
        ...user,
        permissions: await this.fetchAggregatedPermissionsForUser(user.id),
      }))
    );

    this.usuarios = hydratedUsers;
  }

  private async fetchAggregatedPermissionsForUser(userId: string): Promise<string[]> {
    if (!this.grupos.length) return [];

    const permissionsByGroup = await Promise.all(
      this.grupos.map((group) => this.fetchPermissionsByGroupAndUser(group.id, userId))
    );

    return [...new Set(permissionsByGroup.flat())];
  }

  private async fetchPermissionsByGroupAndUser(groupId: string, userId: string): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE_URL_groups}/groups/${groupId}/permissions/${userId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) return [];

      const json = await response.json();
      return this.extractApiData<string[]>(json) || [];
    } catch {
      return [];
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const userId = this.getCurrentUserId();
    const token = localStorage.getItem('token');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (userId) headers['x-user-id'] = userId;
    if (token) headers['Authorization'] = `Bearer ${token}`;

    return headers;
  }

  private extractApiData<T>(responseJson: any): T {
    if (responseJson && typeof responseJson === 'object' && 'data' in responseJson) {
      return responseJson.data as T;
    }
    return responseJson as T;
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

}
