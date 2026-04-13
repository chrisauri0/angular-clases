import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PanelModule } from 'primeng/panel';
import { TagModule } from 'primeng/tag';
import { CheckboxModule } from 'primeng/checkbox';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { API_BASE_URL_groups, API_BASE_URL_tickets } from '../../../services/api.config';
import { PermissionsService } from '../../../services/permissions.service';

interface GroupDto {
  id: string;
  name: string;
}

interface TicketDto {
  id: string;
  title: string;
  group_id: string;
  status: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
}


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [PanelModule, TagModule, CheckboxModule, CardModule, ButtonModule, ChartModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  loading = false;
  errorMessage = '';

  totalTickets = 0;
  totalGrupos = 0;
  ticketsPendientes = 0;

  estadoChartData: any;
  prioridadChartData: any;
  grupoChartData: any;
  chartOptions: any;

  private groups: GroupDto[] = [];
  private tickets: TicketDto[] = [];

  constructor(private router: Router, public permissionsService: PermissionsService) {}

  ngOnInit(): void {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#334155',
          },
        },
      },
      scales: {
        x: {
          ticks: { color: '#475569' },
          grid: { color: '#e2e8f0' },
        },
        y: {
          ticks: { color: '#475569' },
          grid: { color: '#e2e8f0' },
        },
      },
    };

    this.loadDashboardData();
  }

  get permissions(): string[] {
    return this.permissionsService.userPermissions();
  }

  async loadDashboardData() {
    this.loading = true;
    this.errorMessage = '';

    try {
      await this.loadGroups();
      await this.loadTicketsByGroups();
      this.buildSummary();
      this.buildCharts();
    } catch {
      this.errorMessage = 'No se pudieron cargar las métricas del dashboard.';
    } finally {
      this.loading = false;
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('token');
    const rawUser = localStorage.getItem('user');
    const user = rawUser ? JSON.parse(rawUser) : null;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (user?.id) headers['x-user-id'] = user.id;

    return headers;
  }

  private extractApiData<T>(responseJson: any): T {
    if (responseJson && typeof responseJson === 'object' && 'data' in responseJson) {
      return responseJson.data as T;
    }
    return responseJson as T;
  }

  private async loadGroups() {
    const response = await fetch(`${API_BASE_URL_groups}/groups`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) throw new Error('groups');

    const json = await response.json();
    this.groups = this.extractApiData<GroupDto[]>(json) || [];
    this.totalGrupos = this.groups.length;
  }

  private async loadTicketsByGroups() {
    const requests = this.groups.map((group) =>
      fetch(`${API_BASE_URL_tickets}/tickets?groupId=${group.id}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })
    );

    const responses = await Promise.all(requests);
    const dataPromises = responses
      .filter((response) => response.ok)
      .map(async (response) => this.extractApiData<TicketDto[]>(await response.json()) || []);

    const ticketsByGroup = await Promise.all(dataPromises);
    this.tickets = ticketsByGroup.flat();
  }

  private buildSummary() {
    this.totalTickets = this.tickets.length;
    this.ticketsPendientes = this.tickets.filter((ticket) => ticket.status === 'todo').length;
  }

  private buildCharts() {
    const estadoCount = {
      Pendiente: this.tickets.filter((ticket) => ticket.status === 'todo').length,
      'En progreso': this.tickets.filter((ticket) => ticket.status === 'in_progress').length,
      Hecho: this.tickets.filter((ticket) => ticket.status === 'done').length,
    };

    const prioridadCount = {
      Baja: this.tickets.filter((ticket) => ticket.priority === 'low').length,
      Media: this.tickets.filter((ticket) => !ticket.priority || ticket.priority === 'medium').length,
      Alta: this.tickets.filter((ticket) => ticket.priority === 'high').length,
    };

    const groupNameById = new Map(this.groups.map((group) => [group.id, group.name]));
    const groupCountMap = new Map<string, number>();

    this.tickets.forEach((ticket) => {
      const groupName = groupNameById.get(ticket.group_id) || 'Grupo';
      groupCountMap.set(groupName, (groupCountMap.get(groupName) || 0) + 1);
    });

    this.estadoChartData = {
      labels: Object.keys(estadoCount),
      datasets: [
        {
          data: Object.values(estadoCount),
          backgroundColor: ['#f59e0b', '#3b82f6', '#10b981'],
        },
      ],
    };

    this.prioridadChartData = {
      labels: Object.keys(prioridadCount),
      datasets: [
        {
          label: 'Tickets por prioridad',
          data: Object.values(prioridadCount),
          backgroundColor: ['#64748b', '#0ea5e9', '#ef4444'],
        },
      ],
    };

    this.grupoChartData = {
      labels: Array.from(groupCountMap.keys()),
      datasets: [
        {
          label: 'Tickets por grupo',
          data: Array.from(groupCountMap.values()),
          backgroundColor: '#6366f1',
        },
      ],
    };
  }

  goToGrupo(grupo: string) {
    // Puedes ajustar las rutas según tu configuración
    if (grupo === 'equipo-dev') {
      this.router.navigate(['/grupos', 'equipo-dev']);
    } else if (grupo === 'soporte-tecnico') {
      this.router.navigate(['/grupos', 'soporte-tecnico']);
    }
  }
}
