import { Component, inject,OnInit } from '@angular/core';
import { CardModule } from 'primeng/card';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext'
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { RippleModule } from 'primeng/ripple';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { Dialog, DialogModule } from 'primeng/dialog';




@Component({
  selector: 'app-grupos',
  standalone: true,
  imports: [CardModule, ButtonModule, ToastModule, RippleModule, FloatLabelModule, InputTextModule, FormsModule, TableModule, DialogModule],
  providers: [MessageService, ],
  templateUrl: './grupos.html',
  styleUrl: './grupos.scss',
})
export class Grupos implements OnInit {

    visible: boolean = false;

    showDialog() {
        this.visible = true;
    }

 
grupos: any[] = [
    { id: 1, nombre: 'Grupo A', nivel: 'Nivel 1', integrantes: 5, tickets: 10, descripcion: 'Este es un grupo de ejemplo para demostrar la funcionalidad de la aplicación.' },
    { id: 2, nombre: 'Grupo B', nivel: 'Nivel 2', integrantes: 3, tickets: 5, descripcion: 'Este es otro grupo de ejemplo para demostrar la funcionalidad de la aplicación.' },
    { id: 3, nombre: 'Grupo C', nivel: 'Nivel 3', integrantes: 8, tickets: 15, descripcion: 'Este es un tercer grupo de ejemplo para demostrar la funcionalidad de la aplicación.' }
];  

  ngOnInit(): void {
    
  }
  autor: string = "";
  nombre: string = "";


    private messageService = inject(MessageService);
    
nivel: any;
integrantes: any;
tickets: any;
descripcion: any;

    showSuccess() {
        this.messageService.add({severity:'success', summary: 'Success', detail: 'Message Content'});
    }

}
