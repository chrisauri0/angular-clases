import { Component } from '@angular/core';

import { MenubarModule } from 'primeng/menubar';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  imports: [MenubarModule, RouterOutlet],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
items = [
    { label: 'Inicio', routerLink: '/landing' },
    { label: 'Iniciar sesión', routerLink: '/login' },
    { label: 'Registrarse', routerLink: '/register' }
    // Agrega más rutas aquí si lo necesitas
  ];
}
