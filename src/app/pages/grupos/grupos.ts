import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
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
import { PanelModule } from 'primeng/panel';
import { TagModule } from 'primeng/tag';
import { HasPermissionDirective } from '../../directives/has-permission.directive';

import { DragDropModule } from 'primeng/dragdrop';


import { CheckboxModule } from 'primeng/checkbox';
import { signal } from '@angular/core';
import { SelectModule } from 'primeng/select';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProgressBarModule } from 'primeng/progressbar';
import { SliderModule } from 'primeng/slider';
import { DatePickerModule } from 'primeng/datepicker';
import { Router } from '@angular/router';
import { PermissionsService } from '../../services/permissions.service';





 interface Comment {
  user: string
  message: string
  date: Date
}

 interface History {
  action: string
  user: string
  date: Date
}

 interface Task {
  id: number
  title: string
  description: string
  status: string
  assignee: string
  priority: string
  created: Date
  dueDate: Date
  createdBy: string
  comments: Comment[]
  history: History[]
}


@Component({
  selector: 'app-grupos',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, ToastModule, RippleModule, FloatLabelModule, InputTextModule, FormsModule, TableModule, DialogModule, PanelModule, TagModule, CheckboxModule,DragDropModule, SelectModule, IconFieldModule, InputIconModule, MultiSelectModule, ProgressBarModule, SliderModule, DatePickerModule, HasPermissionDirective ],
  providers: [MessageService, ],
  templateUrl: './grupos.html',
  styleUrl: './grupos.scss',
})
export class Grupos implements OnInit {


  constructor(private route: ActivatedRoute, private router: Router, private authService: PermissionsService) {}

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.grupoParam = params.get('grupo') || '';

             this.allTickets = [
    ...this.pendiente,
    ...this.progreso,
    ...this.revision,
    ...this.hecho
  ];


this.filteredTickets = [...this.allTickets];

        });
    }

  mostrarKanban: boolean = true;

  


  selectedTask: Task | null = null;
currentUser = "Juan P.";



canEditTicket() {
  return this.selectedTask?.createdBy === this.currentUser;
}

canChangeStatus() {
  return this.selectedTask?.assignee === this.currentUser;
}


hasPermission(permission: string): boolean {
  // tu lógica aquí (servicio, roles, etc.)
  return this.authService.hasPermission(permission);
}


newComment = "";

addComment() {

  if(!this.selectedTask || !this.newComment.trim()) return;

  this.selectedTask.comments.push({
    user: this.currentUser,
    message: this.newComment,
    date: new Date()
  });

  this.selectedTask.history.push({
    action: "Agregó un comentario",
    user: this.currentUser,
    date: new Date()
  });

  this.newComment = "";
}
  




changeStatus(status:string){

  if(!this.selectedTask) return;

  const old = this.selectedTask.status;

  this.selectedTask.status = status;

  this.selectedTask.history.push({
    action: `Cambió estado de ${old} a ${status}`,
    user: this.currentUser,
    date: new Date()
  });

}




selectTask(task: Task){
  this.selectedTask = task;
}


     draggedTask: any;

allTickets: Task[] = [];

filteredTickets: Task[] = [];

pendiente: Task[] = [
{
  id: 108,
  title: 'Diseño de Logo',
  description: 'Diseñar un logo moderno y minimalista para la empresa, considerando la identidad visual actual y la futura expansión de la marca.',
  status: 'Pendiente',
  assignee: 'Sin asignar',
  priority: 'Media',
  created: new Date('2026-03-08'),
  dueDate: new Date('2026-03-15'),
  createdBy: 'Carlos M.',

  comments: [
    {
      user: 'Carlos M.',
      message: 'Necesitamos algo moderno pero que mantenga los colores corporativos.',
      date: new Date('2026-03-08T10:30:00')
    }
  ],

  history: [
    {
      user: 'Carlos M.',
      action: 'Creó el ticket',
      date: new Date('2026-03-08T10:00:00')
    }
  ]
}
];



progreso: Task[] = [
{
  id: 102,
  title: 'Arreglar bug login',
  description: 'El login con Google falla al regresar del callback OAuth. El servidor lanza un error 500 relacionado con la validación del token.',
  status: 'En progreso',
  assignee: 'Juan P.',
  priority: 'Alta',
  created: new Date('2026-03-07'),
  dueDate: new Date('2026-03-10'),
  createdBy: 'Ana M.',

  comments: [
    {
      user: 'Juan P.',
      message: 'Estoy revisando el flujo de autenticación con Google.',
      date: new Date('2026-03-08T14:20:00')
    },
    {
      user: 'Ana M.',
      message: 'Puede ser problema con el secret del OAuth.',
      date: new Date('2026-03-08T16:10:00')
    }
  ],

  history: [
    {
      user: 'Ana M.',
      action: 'Creó el ticket',
      date: new Date('2026-03-07T11:00:00')
    },
    {
      user: 'Ana M.',
      action: 'Asignó el ticket a Juan P.',
      date: new Date('2026-03-07T11:10:00')
    },
    {
      user: 'Juan P.',
      action: 'Cambió estado a En progreso',
      date: new Date('2026-03-08T14:00:00')
    }
  ]
}
];



revision: Task[] = [
{
  id: 99,
  title: 'API de Pagos',
  description: 'Implementar la integración con el proveedor de pagos Stripe y validar el flujo completo de transacciones.',
  status: 'Revisión',
  assignee: 'Ana M.',
  priority: 'Crítica',
  created: new Date('2026-03-05'),
  dueDate: new Date('2026-03-20'),
  createdBy: 'Carlos M.',

  comments: [
    {
      user: 'Ana M.',
      message: 'La API ya está implementada, falta revisar algunos casos edge.',
      date: new Date('2026-03-09T09:30:00')
    }
  ],

  history: [
    {
      user: 'Carlos M.',
      action: 'Creó el ticket',
      date: new Date('2026-03-05T09:00:00')
    },
    {
      user: 'Ana M.',
      action: 'Cambió estado a Revisión',
      date: new Date('2026-03-09T09:00:00')
    }
  ]
}
];




hecho: Task[] = [
{
  id: 87,
  title: 'Optimizar consulta de usuarios',
  description: 'Se optimizó la consulta SQL que cargaba la lista de usuarios para reducir el tiempo de respuesta.',
  status: 'Hecho',
  assignee: 'Juan P.',
  priority: 'Media',
  created: new Date('2026-03-01'),
  dueDate: new Date('2026-03-05'),
  createdBy: 'Carlos M.',

  comments: [
    {
      user: 'Juan P.',
      message: 'La consulta ahora usa índices y mejoró bastante.',
      date: new Date('2026-03-03T12:00:00')
    }
  ],

  history: [
    {
      user: 'Carlos M.',
      action: 'Creó el ticket',
      date: new Date('2026-03-01T08:00:00')
    },
    {
      user: 'Juan P.',
      action: 'Cambió estado a Hecho',
      date: new Date('2026-03-04T15:00:00')
    }
  ]
}
];


goToGrupo(grupo: string) {
    // Puedes ajustar las rutas según tu configuración
    if (grupo === 'equipo-dev') {
      this.router.navigate(['/grupos', 'equipo-dev']);
    } else if (grupo === 'soporte-tecnico') {
      this.router.navigate(['/grupos', 'soporte-tecnico']);
    }
  }



mostrarCrearTicket = false;

nuevoTicket: any = {
  title: '',
  description: '',
  priority: '',
  assignee: '',
  dueDate: null
};


usuarios = [
  {label:'Sin asignar', value:'Sin asignar'},
  {label:'Juan P.', value:'Juan P.'},
  {label:'Ana M.', value:'Ana M.'}
];




// hecho: Task[] = [];
dragStart(task:any){
  this.draggedTask = task;
}

drop(column:any[]){
  if(this.draggedTask){

    this.removeTask(this.draggedTask); // quitar primero

    column.push(this.draggedTask);     // luego agregar

    this.draggedTask = null;
  }
}

removeTask(task:any){
  const cols = [this.pendiente, this.progreso, this.revision, this.hecho];

  cols.forEach(col=>{
    const index = col.indexOf(task);

    if(index > -1){
      col.splice(index,1);
    }
  });
}


    grupoParam: string = '';

    equipoDev: boolean = true;
    soporteTecnico: boolean = true;
    uxui : boolean = false;

    visible: boolean = false;

    showDialog() {
        this.visible = true;
    }

 
grupos: any[] = [
    { id: 1, nombre: 'Grupo A', nivel: 'Nivel 1', integrantes: 5, tickets: 10, descripcion: 'Este es un grupo de ejemplo para demostrar la funcionalidad de la aplicación.' },
    { id: 2, nombre: 'Grupo B', nivel: 'Nivel 2', integrantes: 3, tickets: 5, descripcion: 'Este es otro grupo de ejemplo para demostrar la funcionalidad de la aplicación.' },
    { id: 3, nombre: 'Grupo C', nivel: 'Nivel 3', integrantes: 8, tickets: 15, descripcion: 'Este es un tercer grupo de ejemplo para demostrar la funcionalidad de la aplicación.' }
];  

    
  autor: string = "";
  nombre: string = "";


    private messageService = inject(MessageService);
    

    statuses = [
  {label:'Pendiente', value:'Pendiente'},
  {label:'En progreso', value:'En progreso'},
  {label:'Revisión', value:'Revisión'},
  {label:'Hecho', value:'Hecho'}
];

priorities = [
  {label:'Baja', value:'Baja'},
  {label:'Media', value:'Media'},
  {label:'Alta', value:'Alta'},
  {label:'Crítica', value:'Crítica'}
];



mostrarTodos(){
  this.filteredTickets = [...this.allTickets];
}

misTickets(){
  this.filteredTickets = this.allTickets.filter(
    t => t.assignee === this.currentUser
  );
}

ticketsSinAsignar(){
  this.filteredTickets = this.allTickets.filter(
    t => t.assignee === 'Sin asignar'
  );
}

ticketsAltaPrioridad(){
  this.filteredTickets = this.allTickets.filter(
    t => t.priority === 'Alta' || t.priority === 'Crítica'
  );
}




crearTicket(){

const ticket: Task = {
  id: Date.now(),
  title: this.nuevoTicket.title,
  description: this.nuevoTicket.description,
  status: 'Pendiente',
  assignee: this.nuevoTicket.assignee,
  priority: this.nuevoTicket.priority,
  created: new Date(),
  dueDate: this.nuevoTicket.dueDate,
  createdBy: 'Usuario actual',
  comments: [],
  history: []
};

this.pendiente.push(ticket);

this.mostrarCrearTicket = false;

this.nuevoTicket = {
  title:'',
  description:'',
  priority:'',
  assignee:'',
  dueDate:null
};

}






nivel: any;
integrantes: any;
tickets: any;
descripcion: any;

    showSuccess() {
        this.messageService.add({severity:'success', summary: 'Success', detail: 'Message Content'});
    }

}
