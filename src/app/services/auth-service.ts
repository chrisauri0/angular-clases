import { Injectable, signal } from "@angular/core";
import { PermissionsService } from "./permissions.service";
import { API_BASE_URL_users } from "./api.config";

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
    constructor(private permissionsService: PermissionsService) {
        this.restoreSession();
    }

    private _isAuthenticated = signal(false);
    private _role: 'admin' | 'user' | null = null;

    get isAuthenticated() {
        return this._isAuthenticated();
    }

    get role() {
        return this._role;
    }

    restoreSession(): void {
        const token = localStorage.getItem('token');

        if (!token) {
            this.clearSessionState();
            return;
        }

        const tokenPayload = this.decodeJwtPayload(token);
        if (!tokenPayload) {
            this.logout();
            return;
        }

        const permsByGroup = tokenPayload.permsByGroup as Record<string, string[]> | undefined;
        const permissions = permsByGroup
            ? [...new Set(Object.values(permsByGroup).flat())]
            : [];

        this.permissionsService.setPermissions(permissions);
        this._isAuthenticated.set(true);
    }

    async login(email: string, password: string): Promise<boolean> {
        try {
            const response = await fetch(`${API_BASE_URL_users}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                this.logout();
                return false;
            }

            const json = await response.json();
            const data = this.extractLoginData(json);

            if (!data?.token) {
                this.logout();
                return false;
            }

            localStorage.setItem('token', data.token);
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            const tokenPayload = this.decodeJwtPayload(data.token);
            const permsByGroup = tokenPayload?.permsByGroup as Record<string, string[]> | undefined;
            const permissions = permsByGroup
                ? [...new Set(Object.values(permsByGroup).flat())]
                : [];

            this.permissionsService.setPermissions(permissions);
            this._isAuthenticated.set(true);
            this._role = null;

            return true;
        } catch {
            this.logout();
            return false;
        }
    }

    private extractLoginData(responseJson: any): { token?: string; user?: any } | null {
        if (!responseJson || typeof responseJson !== 'object') return null;
        if (responseJson.token) return responseJson;
        if (responseJson.data?.token) return responseJson.data;
        return null;
    }

    private decodeJwtPayload(token: string): any | null {
        try {
            const payloadPart = token.split('.')[1];
            if (!payloadPart) return null;

            const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
            const padded = base64.padEnd(base64.length + (4 - (base64.length % 4 || 4)) % 4, '=');
            return JSON.parse(atob(padded));
        } catch {
            return null;
        }
    }

    logout() {
        this.clearSessionState();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    private clearSessionState(): void {
        this._isAuthenticated.set(false);
        this._role = null;
        this.permissionsService.setPermissions([]);
    }
}