import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PanelModule } from 'primeng/panel';
import { TagModule } from 'primeng/tag';
import { CheckboxModule } from 'primeng/checkbox';


@Component({
  selector: 'app-home',
  imports: [PanelModule, TagModule, CheckboxModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  constructor(private router: Router) {}

  goToGrupo(grupo: string) {
    // Puedes ajustar las rutas según tu configuración
    if (grupo === 'equipo-dev') {
      this.router.navigate(['/grupos', 'equipo-dev']);
    } else if (grupo === 'soporte-tecnico') {
      this.router.navigate(['/grupos', 'soporte-tecnico']);
    }
  }
}
