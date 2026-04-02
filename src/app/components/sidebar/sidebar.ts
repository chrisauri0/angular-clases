import { Component } from '@angular/core';

import { MenubarModule } from 'primeng/menubar';
import { RouterOutlet } from '@angular/router';
import { PanelMenuModule } from 'primeng/panelmenu';
  
@Component({
  selector: 'app-sidebar',
  imports: [MenubarModule, RouterOutlet, PanelMenuModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
items = [
  { label: 'Home', icon: 'pi pi-home', routerLink: '/home' },
  { label: 'Usuarios', icon: 'pi pi-user', routerLink: '/usuarios' },
  { label: 'Grupos', icon: 'pi pi-users', routerLink: '/grupos' },
  { label: 'Cerrar Sesión', icon: 'pi pi-sign-out', routerLink: '/login' },
  { label: 'Version : Practica 3' }
];
}
