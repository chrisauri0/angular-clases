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
    { label: 'Usuarios', routerLink: '/usuarios' },
    { label: 'Grupos', routerLink: '/grupos' },
    { label: 'Cerrar Sesión', routerLink: '/login' },
    { label: 'Version : Practica 3', }
    // Agrega más rutas aquí si lo necesitas
  ];
}
