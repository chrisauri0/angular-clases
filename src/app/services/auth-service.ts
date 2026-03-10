import { Injectable, signal, computed } from "@angular/core";
import { PermissionsService } from "./permissions.service";
import { PermisoAdmin, PermisoBase } from "../directives/permisos.model";

// const PERMISOS_ADMIN = [
//     "tickets:crear", "tickets:editar", "tickets:eliminar",
//     "grupos:crear", "grupos:editar", "grupos:eliminar",
//     "usuarios:crear", "usuarios:editar", "usuarios:eliminar"
// ];
// const PERMISOS_USER = [
//     "tickets:crear", "tickets:editar"
// ];

@Injectable({
    providedIn: "root",
    
})
export class AuthService  {
    constructor(private permissionsService: PermissionsService) {}

    private _isAuthenticated = signal(false);
    private _role: 'admin' | 'user' | null = null;

    // Datos estáticos de usuarios
    private users = [
      { email: 'admin@uteq.edu.mx', password: 'admin123', role: 'admin' },
      { email: 'user@uteq.edu.mx', password: 'user123', role: 'user' }
    ];

    get isAuthenticated() {
        return this._isAuthenticated();
    }

    get role() {
        return this._role;
    }

    login(email: string, password: string): 'admin' | 'user' | null {
        const user = this.users.find(u => u.email === email && u.password === password);
        if (user) {
            this._isAuthenticated.set(true);
            this._role = user.role as 'admin' | 'user';
            if (user.role === 'admin') {
                this.permissionsService.setPermissions(PermisoAdmin);
            } else {
                this.permissionsService.setPermissions(PermisoBase);
            }
            return user.role as 'admin' | 'user';
        } else {
            this._isAuthenticated.set(false);
            this._role = null;
            this.permissionsService.setPermissions([]);
            return null;
        }
    }

    logout() {
        this._isAuthenticated.set(false);
        this._role = null;
        this.permissionsService.setPermissions([]);
    }
}