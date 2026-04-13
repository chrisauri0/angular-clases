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
import { API_BASE_URL_users, API_BASE_URL_groups, API_BASE_URL_tickets } from '../../services/api.config';





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
  id: string
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

interface GroupDto {
  id: string;
  name: string;
  description?: string | null;
  created_at?: string;
}

interface UserDto {
  id: string;
  name: string;
  email: string;
  created_at?: string;
}

interface TicketDto {
  id: string;
  title: string;
  description?: string | null;
  group_id: string;
  assigned_to?: string | null;
  priority?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

type BackendStatus = 'todo' | 'in_progress' | 'done';
type FrontendStatus = 'Pendiente' | 'En progreso' | 'Hecho' | 'Revisión';


@Component({
  selector: 'app-grupos',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, ToastModule, RippleModule, FloatLabelModule, InputTextModule, FormsModule, TableModule, DialogModule, PanelModule, TagModule, CheckboxModule,DragDropModule, SelectModule, IconFieldModule, InputIconModule, MultiSelectModule, ProgressBarModule, SliderModule, DatePickerModule, HasPermissionDirective ],
  providers: [MessageService, ],
  templateUrl: './grupos.html',
  styleUrl: './grupos.scss',
})
export class Grupos implements OnInit {
  private readonly dueDatesStorageKey = 'ticket_due_dates';
  private dueDatesByTicketId: Record<string, string> = {};


  constructor(private route: ActivatedRoute, private router: Router, private authService: PermissionsService) {}

  get selectedGroup(): GroupDto | undefined {
    return this.grupos.find((group) => String(group.id) === this.grupoParam);
  }

    ngOnInit(): void {
      this.loadDueDatesFromStorage();
        this.loadUsers();
        this.loadGroups();

        this.route.paramMap.subscribe(params => {
            this.grupoParam = params.get('grupo') || '';

            if (this.grupoParam) {
              this.loadTickets(this.grupoParam);
            } else {
              this.allTickets = [];
              this.filteredTickets = [];
              this.pendiente = [];
              this.progreso = [];
              this.revision = [];
              this.hecho = [];
            }
        });
    }

  private getCurrentUserId(): string | null {
    try {
      const rawUser = localStorage.getItem('user');
      if (!rawUser) return null;
      const user = JSON.parse(rawUser);
      return user?.id ?? null;
    } catch {
      return null;
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const userId = this.getCurrentUserId();
    const token = localStorage.getItem('token');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (userId) headers['x-user-id'] = userId;
    if (token) headers['Authorization'] = `Bearer ${token}`;

    return headers;
  }

  private extractApiData<T>(responseJson: any): T {
    if (responseJson && typeof responseJson === 'object' && 'data' in responseJson) {
      return responseJson.data as T;
    }
    return responseJson as T;
  }

  async loadGroups() {
    const userId = this.getCurrentUserId();
    if (!userId) return;

    try {
      const response = await fetch(`${API_BASE_URL_groups}/groups`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los grupos' });
        return;
      }

      const json = await response.json();
      this.grupos = this.extractApiData<GroupDto[]>(json) || [];

      if (this.grupoParam) {
        this.loadTickets(this.grupoParam);
      }
    } catch {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error de conexión al cargar grupos' });
    }
  }

  async createGroup() {
    const userId = this.getCurrentUserId();
    if (!userId) {
      this.messageService.add({ severity: 'warn', summary: 'Sesión', detail: 'No se encontró el usuario autenticado' });
      return;
    }

    const groupName = this.nombre?.trim();
    if (!groupName) {
      this.messageService.add({ severity: 'warn', summary: 'Datos', detail: 'El nombre del grupo es obligatorio' });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL_groups}/groups`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          name: groupName,
          description: this.descripcion?.trim() || null,
        }),
      });

      if (!response.ok) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el grupo' });
        return;
      }

      const json = await response.json();
      const created = this.extractApiData<GroupDto>(json);

      this.messageService.add({ severity: 'success', summary: 'Grupo creado', detail: created?.name || 'Grupo creado correctamente' });
      this.visible = false;
      this.nombre = '';
      this.descripcion = '';
      await this.loadGroups();
    } catch {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error de conexión al crear grupo' });
    }
  }

  async addMemberToGroup(groupId: string, userId: string, permissions: string[]) {
    try {
      const response = await fetch(`${API_BASE_URL_groups}/groups/${groupId}/members`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ userId, permissions }),
      });

      if (!response.ok) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo agregar el miembro' });
        return;
      }

      this.messageService.add({ severity: 'success', summary: 'Miembro agregado', detail: 'Se asignaron los permisos correctamente' });
    } catch {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error de conexión al agregar miembro' });
    }
  }

  async getGroupPermissions(groupId: string, userId: string): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE_URL_groups}/groups/${groupId}/permissions/${userId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        return [];
      }

      const json = await response.json();
      return this.extractApiData<string[]>(json) || [];
    } catch {
      return [];
    }
  }

  async loadUsers() {
    try {
      const response = await fetch(`${API_BASE_URL_users}/users`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        return;
      }

      const json = await response.json();
      const users = this.extractApiData<UserDto[]>(json) || [];

      this.usuariosSistema = users;
      this.usuarios = [
        { label: 'Sin asignar', value: 'Sin asignar' },
        ...users.map((user) => ({ label: user.name, value: user.name })),
      ];
    } catch {
      // Sin bloqueo de la vista principal si falla usuarios.
    }
  }

  selectedMemberUserId: string | null = null;
  selectedMemberPermissions: string[] = [];

  availablePermissions = [
    { label: 'tickets:crear', value: 'tickets:crear' },
    { label: 'tickets:editar', value: 'tickets:editar' },
    { label: 'tickets:eliminar', value: 'tickets:eliminar' },
    { label: 'grupos:crear', value: 'grupos:crear' },
    { label: 'grupos:editar', value: 'grupos:editar' },
    { label: 'grupos:eliminar', value: 'grupos:eliminar' },
    { label: 'usuarios:crear', value: 'usuarios:crear' },
    { label: 'usuarios:editar', value: 'usuarios:editar' },
    { label: 'usuarios:eliminar', value: 'usuarios:eliminar' },
  ];

  editingGroupId: string | null = null;
  editCache: Record<string, { name: string; description: string | null }> = {};

  // Mapeo de estados: backend <-> frontend
  private backendToFrontendStatus: Record<string, FrontendStatus> = {
    'todo': 'Pendiente',
    'in_progress': 'En progreso',
    'done': 'Hecho',
  };

  private frontendToBackendStatus: Record<FrontendStatus, BackendStatus> = {
    'Pendiente': 'todo',
    'En progreso': 'in_progress',
    'Hecho': 'done',
    'Revisión': 'in_progress', // Revisión se mapea a in_progress
  };

  async loadTickets(groupId: string) {
    try {
      const response = await fetch(`${API_BASE_URL_tickets}/tickets?groupId=${groupId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        return;
      }

      const json = await response.json();
      const tickets = this.extractApiData<TicketDto[]>(json) || [];

      this.organizeTicketsByStatus(tickets);
      this.allTickets = tickets.map((t) => this.ticketDtoToTask(t));
      this.filteredTickets = [...this.allTickets];
    } catch {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar tickets' });
    }
  }

  private ticketDtoToTask(ticket: TicketDto): Task {
    const frontendStatus = this.backendToFrontendStatus[ticket.status] || 'Pendiente';
    return {
      id: ticket.id,
      title: ticket.title,
      description: ticket.description || '',
      status: frontendStatus,
      assignee: ticket.assigned_to ? this.usuariosSistema.find(u => u.id === ticket.assigned_to)?.name || 'Sin asignar' : 'Sin asignar',
      priority: this.mapPriority(ticket.priority),
      created: new Date(ticket.created_at || ''),
      dueDate: this.getDueDateForTicket(ticket),
      createdBy: ticket.created_by || '',
      comments: [],
      history: [],
    };
  }

  private mapPriority(backendPriority?: string): string {
    const map: Record<string, string> = {
      'low': 'Baja',
      'medium': 'Media',
      'high': 'Alta',
    };
    return map[backendPriority || 'medium'] || 'Media';
  }

  private mapPriorityToBackend(frontendPriority?: string): 'low' | 'medium' | 'high' {
    const map: Record<string, 'low' | 'medium' | 'high'> = {
      'Baja': 'low',
      'Media': 'medium',
      'Alta': 'high',
      'Crítica': 'high',
    };
    return map[frontendPriority || 'Media'] || 'medium';
  }

  private loadDueDatesFromStorage(): void {
    try {
      const raw = localStorage.getItem(this.dueDatesStorageKey);
      this.dueDatesByTicketId = raw ? JSON.parse(raw) : {};
    } catch {
      this.dueDatesByTicketId = {};
    }
  }

  private saveDueDatesToStorage(): void {
    localStorage.setItem(this.dueDatesStorageKey, JSON.stringify(this.dueDatesByTicketId));
  }

  private getDueDateForTicket(ticket: TicketDto): Date {
    const savedDueDate = this.dueDatesByTicketId[ticket.id];
    if (savedDueDate) return new Date(savedDueDate);
    if (ticket.created_at) return new Date(ticket.created_at);
    return new Date();
  }

  private setDueDateForTicket(ticketId: string, dueDate: Date | string | null | undefined): void {
    if (!dueDate) return;
    const value = dueDate instanceof Date ? dueDate.toISOString() : new Date(dueDate).toISOString();
    this.dueDatesByTicketId[ticketId] = value;
    this.saveDueDatesToStorage();
  }

  async loadTicketById(ticketId: string): Promise<Task | null> {
    try {
      const response = await fetch(`${API_BASE_URL_tickets}/tickets/${ticketId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        return null;
      }

      const json = await response.json();
      const ticket = this.extractApiData<TicketDto>(json);
      if (!ticket) return null;

      return this.ticketDtoToTask(ticket);
    } catch {
      return null;
    }
  }

  private organizeTicketsByStatus(tickets: TicketDto[]) {
    this.pendiente = [];
    this.progreso = [];
    this.revision = [];
    this.hecho = [];

    tickets.forEach((ticket) => {
      const task = this.ticketDtoToTask(ticket);

      switch (task.status) {
        case 'Pendiente':
          this.pendiente.push(task);
          break;
        case 'En progreso':
          this.progreso.push(task);
          break;
        case 'Revisión':
          this.revision.push(task);
          break;
        case 'Hecho':
          this.hecho.push(task);
          break;
      }
    });
  }

  get userOptions() {
    return this.usuariosSistema.map((user) => ({
      label: `${user.name} (${user.email})`,
      value: user.id,
    }));
  }

  async assignMemberToSelectedGroup() {
    if (!this.selectedGroup?.id) {
      this.messageService.add({ severity: 'warn', summary: 'Grupo', detail: 'Selecciona primero un grupo' });
      return;
    }

    if (!this.selectedMemberUserId || this.selectedMemberPermissions.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Datos', detail: 'Selecciona usuario y permisos' });
      return;
    }

    await this.addMemberToGroup(this.selectedGroup.id, this.selectedMemberUserId, this.selectedMemberPermissions);

    const latestPerms = await this.getGroupPermissions(this.selectedGroup.id, this.selectedMemberUserId);
    this.messageService.add({
      severity: 'info',
      summary: 'Permisos actuales (scoped al grupo)',
      detail: latestPerms.length > 0 ? latestPerms.join(', ') : 'El usuario no tiene permisos en este grupo',
    });
  }

  startEditGroup(group: GroupDto) {
    this.editingGroupId = group.id;
    this.editCache[group.id] = {
      name: group.name,
      description: group.description || null,
    };
  }

  cancelEditGroup() {
    this.editingGroupId = null;
  }

  async saveEditGroup(group: GroupDto) {
    if (!this.editingGroupId) return;

    const cached = this.editCache[this.editingGroupId];
    if (!cached || !cached.name?.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Datos', detail: 'El nombre del grupo es obligatorio' });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL_groups}/groups/${group.id}`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          name: cached.name.trim(),
          description: cached.description?.trim() || null,
        }),
      });

      if (!response.ok) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el grupo' });
        return;
      }

      const json = await response.json();
      const updated = this.extractApiData<GroupDto>(json);

      Object.assign(group, updated);
      this.editingGroupId = null;
      delete this.editCache[group.id];

      this.messageService.add({ severity: 'success', summary: 'Grupo actualizado', detail: 'Los cambios se guardaron correctamente' });
    } catch {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error de conexión al actualizar grupo' });
    }
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
  




async changeStatus(status: string) {
  if (!this.selectedTask) return;

  const backendStatus = this.frontendToBackendStatus[status as FrontendStatus];
  if (!backendStatus) return;

  try {
    const response = await fetch(`${API_BASE_URL_tickets}/tickets/${this.selectedTask.id}/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status: backendStatus }),
    });

    if (!response.ok) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el estado' });
      return;
    }

    const old = this.selectedTask.status;
    this.selectedTask.status = status;

    this.selectedTask.history.push({
      action: `Cambió estado de ${old} a ${status}`,
      user: this.currentUser,
      date: new Date()
    });

    this.messageService.add({ severity: 'success', summary: 'Estado actualizado', detail: `Ticket movido a ${status}` });
  } catch {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error de conexión al actualizar estado' });
  }
}

async saveSelectedTaskChanges() {
  if (!this.selectedTask) return;

  const assignedToId = this.selectedTask.assignee && this.selectedTask.assignee !== 'Sin asignar'
    ? this.usuariosSistema.find((u) => u.name === this.selectedTask?.assignee)?.id
    : null;

  try {
    const response = await fetch(`${API_BASE_URL_tickets}/tickets/${this.selectedTask.id}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        title: this.selectedTask.title?.trim(),
        description: this.selectedTask.description?.trim() || null,
        assigned_to: assignedToId,
        priority: this.mapPriorityToBackend(this.selectedTask.priority),
      }),
    });

    if (!response.ok) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el ticket' });
      return;
    }

    const statusResponse = await fetch(`${API_BASE_URL_tickets}/tickets/${this.selectedTask.id}/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        status: this.frontendToBackendStatus[this.selectedTask.status as FrontendStatus],
      }),
    });

    if (!statusResponse.ok) {
      this.messageService.add({ severity: 'warn', summary: 'Guardado parcial', detail: 'Se guardó el ticket, pero no el estado' });
    }

    if (this.selectedGroup?.id) {
      await this.loadTickets(this.selectedGroup.id);
    }
    this.setDueDateForTicket(this.selectedTask.id, this.selectedTask.dueDate);
    this.messageService.add({ severity: 'success', summary: 'Guardado', detail: 'Cambios del ticket persistidos' });
    this.messageService.add({ severity: 'info', summary: 'Fecha límite', detail: 'La fecha límite se guarda localmente hasta que el backend soporte due_date.' });
  } catch {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error de conexión al guardar cambios' });
  }
}




async selectTask(task: Task){
  const detailed = await this.loadTicketById(task.id);
  this.selectedTask = detailed ?? task;

  if (this.selectedTask) {
    const dueDateSaved = this.dueDatesByTicketId[this.selectedTask.id];
    if (dueDateSaved) {
      this.selectedTask.dueDate = new Date(dueDateSaved);
    }
  }
}

async deleteSelectedTask() {
  if (!this.selectedTask) return;

  try {
    const response = await fetch(`${API_BASE_URL_tickets}/tickets/${this.selectedTask.id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el ticket' });
      return;
    }

    this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Ticket eliminado correctamente' });
    this.selectedTask = null;

    if (this.selectedGroup?.id) {
      await this.loadTickets(this.selectedGroup.id);
    }
  } catch {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error de conexión al eliminar ticket' });
  }
}


     draggedTask: any;

allTickets: Task[] = [];

filteredTickets: Task[] = [];

pendiente: Task[] = [];



progreso: Task[] = [];



revision: Task[] = [];




hecho: Task[] = [];


goToGrupo(grupo: string) {
    this.router.navigate(['/grupos', grupo]);
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

usuariosSistema: UserDto[] = [];




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

 
grupos: GroupDto[] = [];  

    
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




async crearTicket(){
  if (!this.selectedGroup?.id) {
    this.messageService.add({ severity: 'warn', summary: 'Grupo', detail: 'Selecciona un grupo primero' });
    return;
  }

  if (!this.nuevoTicket.title?.trim()) {
    this.messageService.add({ severity: 'warn', summary: 'Datos', detail: 'El título es obligatorio' });
    return;
  }

  try {
    const priorityMap: Record<string, string> = { 'Baja': 'low', 'Media': 'medium', 'Alta': 'high', 'Crítica': 'high' };

    const response = await fetch(`${API_BASE_URL_tickets}/tickets`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        title: this.nuevoTicket.title.trim(),
        description: this.nuevoTicket.description?.trim() || null,
        group_id: this.selectedGroup.id,
        assigned_to: this.nuevoTicket.assignee && this.nuevoTicket.assignee !== 'Sin asignar' 
          ? this.usuariosSistema.find(u => u.name === this.nuevoTicket.assignee)?.id 
          : null,
        priority: priorityMap[this.nuevoTicket.priority] || 'medium',
      }),
    });

    if (!response.ok) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el ticket' });
      return;
    }

    const json = await response.json();
    const created = this.extractApiData<TicketDto>(json);

    if (created?.id && this.nuevoTicket.dueDate) {
      this.setDueDateForTicket(created.id, this.nuevoTicket.dueDate);
    }

    this.messageService.add({ severity: 'success', summary: 'Ticket creado', detail: created?.title || 'Ticket creado correctamente' });
    this.mostrarCrearTicket = false;

    this.nuevoTicket = {
      title: '',
      description: '',
      priority: '',
      assignee: '',
      dueDate: null
    };

    await this.loadTickets(this.selectedGroup.id);
  } catch {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error de conexión al crear ticket' });
  }
}






nivel: any;
integrantes: any;
tickets: any;
descripcion: any;

    showSuccess() {
        this.messageService.add({severity:'success', summary: 'Success', detail: 'Message Content'});
    }

}
