import { Injectable, signal } from "@angular/core";


@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  private readonly _userPermissions = signal<string[]>([]);
  readonly userPermissions = this._userPermissions.asReadonly();

  setPermissions(perms: string[]) {
    this._userPermissions.set(perms);
  }

  hasPermission(permission: string): boolean {
    return this._userPermissions().includes(permission);
  }
  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(perm => this.hasPermission(perm));
  }
}