import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {MainLayout} from './components/layouts/main-layout/main-layout';
import {HasPermissionDirective} from './directives/has-permission.directive';
import {PermissionsService} from './services/permissions.service';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet,HasPermissionDirective ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

  constructor(private permsSvc: PermissionsService) {

    const jwtPerms =["tickets:crear", "tickets:editar", "tickets:eliminar", "grupos:crear", "grupos:editar", "grupos:eliminar", "usuarios:crear", "usuarios:editar", "usuarios:eliminar"];

    this.permsSvc.setPermissions(jwtPerms);
  }

  protected readonly title = signal('ERP');
}
