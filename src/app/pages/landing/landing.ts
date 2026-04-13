import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-landing',
  imports: [FormsModule, InputTextModule, ButtonModule],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing {
  url_produccion = '';

  constructor() {
    this.url_produccion = localStorage.getItem('url_produccion') || '';
  }

  saveProductionUrl() {
    const value = this.url_produccion.trim();
    if (!value) return;

    localStorage.setItem('url_produccion', value);
    window.location.reload();
  }

  clearProductionUrl() {
    localStorage.removeItem('url_produccion');
    this.url_produccion = '';
    window.location.reload();
  }

}
