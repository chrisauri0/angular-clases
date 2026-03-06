import { Injectable, signal } from "@angular/core";


@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  private  userPermissions = signal<string[]>([]);

  setPermissions(perms: string[]) {
    this.userPermissions.set(perms);
  }

  hasPermission(permission: string): boolean {
    return this.userPermissions().includes(permission);
  }
  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(perm => this.hasPermission(perm));
  }
}