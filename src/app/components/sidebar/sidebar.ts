import { Component } from '@angular/core';

import { MenubarModule } from 'primeng/menubar';
import { RouterOutlet } from '@angular/router';
  
@Component({
  selector: 'app-sidebar',
  imports: [MenubarModule, RouterOutlet],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
items = [
    { label: 'Inicio', routerLink: '/landing' },
    { label: 'Iniciar sesión', routerLink: '/login' },
    { label: 'Registrarse', routerLink: '/register' }
    // Agrega más rutas aquí si lo necesitas
  ];
}
