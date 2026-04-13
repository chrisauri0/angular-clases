import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-metricas',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, TableModule, TagModule, ButtonModule, ProgressSpinnerModule, InputTextModule, SelectModule],
  templateUrl: './metricas.html',
  styleUrl: './metricas.scss',
})
export class Metricas implements OnInit {
  loading = false;
  loadingMetrics = false;
  loadingLogs = false;
  loadingErrors = false;
  loadingAppLogs = false;
  errorMessage = '';
  logsErrorMessage = '';
  errorsErrorMessage = '';
  appLogsErrorMessage = '';

  summary = {
    total_requests: 0,
    total_error_status: 0,
    global_avg_response_ms: '0.00',
  };

  byEndpoint: Array<{
    service_name: string;
    method: string;
    endpoint: string;
    request_count: number;
    avg_response_ms: string;
  }> = [];

  requestLogs: Array<{
    service_name: string;
    method: string;
    endpoint: string;
    status_code: number;
    response_ms: string;
    created_at: string;
  }> = [];

  errorLogs: Array<{
    service_name: string;
    method: string;
    endpoint: string;
    status_code: number;
    error_message: string;
    created_at: string;
  }> = [];

  appLogs: Array<{
    service_name: string;
    event_type: string;
    message: string;
    created_at: string;
  }> = [];

  searchValue = '';
  selectedService: string | null = null;
  selectedMethod: string | null = null;
  serviceOptions: Array<{ label: string; value: string }> = [];
  methodOptions: Array<{ label: string; value: string }> = [];

  ngOnInit() {
    this.reloadAll();
  }

  async reloadAll() {
    this.loading = true;
    await Promise.all([this.fetchMetrics(), this.fetchLogs(), this.fetchErrors(), this.fetchAppLogs()]);
    this.loading = false;
  }

  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private normalizeApiData(payload: any): any {
    if (payload && typeof payload === 'object' && payload.data !== undefined) {
      return payload.data;
    }
    return payload;
  }

  async fetchAppLogs() {
    this.loadingAppLogs = true;
    this.appLogsErrorMessage = '';

    try {
      const token = this.getToken();
      if (!token) {
        this.appLogsErrorMessage = 'No hay token de sesión para consultar app logs.';
        return;
      }

      const response = await fetch('http://localhost:3000/logs/app?service_name=gateway&event_type=incoming_request&limit=50', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        this.appLogsErrorMessage = `No se pudieron cargar app logs (${response.status} ${response.statusText})`;
        return;
      }

      const payload = await response.json();
      const data = this.normalizeApiData(payload);

      const rows = Array.isArray(data)
        ? data
        : Array.isArray(data?.logs)
          ? data.logs
          : [];

      this.appLogs = rows.map((row: any) => ({
        service_name: String(row?.service_name ?? row?.service ?? 'N/A'),
        event_type: String(row?.event_type ?? 'N/A'),
        message: String(row?.message ?? row?.detail ?? row?.endpoint ?? 'Sin detalle'),
        created_at: String(row?.created_at ?? row?.timestamp ?? ''),
      }));
    } catch {
      this.appLogsErrorMessage = 'Error de conexión al consultar app logs.';
    } finally {
      this.loadingAppLogs = false;
    }
  }


  async fetchLogs() {
    this.loadingLogs = true;
    this.logsErrorMessage = '';

    try {
      const token = this.getToken();
      if (!token) {
        this.logsErrorMessage = 'No hay token de sesión para consultar logs.';
        return;
      }

      const response = await fetch('http://localhost:3000/logs/requests', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        this.logsErrorMessage = `No se pudieron cargar logs (${response.status} ${response.statusText})`;
        return;
      }

      const payload = await response.json();
      const data = this.normalizeApiData(payload);

      const rows = Array.isArray(data)
        ? data
        : Array.isArray(data?.requests)
          ? data.requests
          : [];

      this.requestLogs = rows.map((row: any) => ({
        service_name: String(row?.service_name ?? row?.service ?? 'N/A'),
        method: String(row?.method ?? 'N/A'),
        endpoint: String(row?.endpoint ?? row?.path ?? 'N/A'),
        status_code: Number(row?.status_code ?? row?.status ?? 0),
        response_ms: String(row?.response_ms ?? row?.duration_ms ?? '0.00'),
        created_at: String(row?.created_at ?? row?.timestamp ?? ''),
      }));
    } catch {
      this.logsErrorMessage = 'Error de conexión al consultar logs.';
    } finally {
      this.loadingLogs = false;
    }

  }

  async fetchErrors() {
    this.loadingErrors = true;
    this.errorsErrorMessage = '';

    try {
      const token = this.getToken();
      if (!token) {
        this.errorsErrorMessage = 'No hay token de sesión para consultar errores.';
        return;
      }

      const response = await fetch('http://localhost:3000/logs/errors', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        this.errorsErrorMessage = `No se pudieron cargar errores (${response.status} ${response.statusText})`;
        return;
      }

      const payload = await response.json();
      const data = this.normalizeApiData(payload);

      const rows = Array.isArray(data)
        ? data
        : Array.isArray(data?.errors)
          ? data.errors
          : [];

      this.errorLogs = rows.map((row: any) => ({
        service_name: String(row?.service_name ?? row?.service ?? 'N/A'),
        method: String(row?.method ?? 'N/A'),
        endpoint: String(row?.endpoint ?? row?.path ?? 'N/A'),
        status_code: Number(row?.status_code ?? row?.status ?? 0),
        error_message: String(row?.error_message ?? row?.message ?? 'Sin detalle'),
        created_at: String(row?.created_at ?? row?.timestamp ?? ''),
      }));
    } catch {
      this.errorsErrorMessage = 'Error de conexión al consultar errores.';
    } finally {
      this.loadingErrors = false;
    }
  }

  async fetchMetrics() {
    this.loadingMetrics = true;
    this.errorMessage = '';

    try {
      const token = this.getToken();
      if (!token) {
        this.errorMessage = 'No hay token de sesión. Inicia sesión nuevamente.';
        return;
      }

      const response = await fetch('http://localhost:3000/metrics', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        this.errorMessage = `No se pudieron cargar métricas (${response.status} ${response.statusText})`;
        return;
      }

      const payload = await response.json();
      const data = this.normalizeApiData(payload) ?? {};

      this.summary = {
        total_requests: Number(data?.summary?.total_requests ?? 0),
        total_error_status: Number(data?.summary?.total_error_status ?? 0),
        global_avg_response_ms: String(data?.summary?.global_avg_response_ms ?? '0.00'),
      };

      this.byEndpoint = Array.isArray(data?.byEndpoint)
        ? data.byEndpoint.map((row: any) => ({
            service_name: String(row?.service_name ?? 'N/A'),
            method: String(row?.method ?? 'N/A'),
            endpoint: String(row?.endpoint ?? 'N/A'),
            request_count: Number(row?.request_count ?? 0),
            avg_response_ms: String(row?.avg_response_ms ?? '0.00'),
          }))
        : [];

      const services = [...new Set(this.byEndpoint.map((row) => row.service_name))];
      const methods = [...new Set(this.byEndpoint.map((row) => row.method))];

      this.serviceOptions = services.map((service) => ({ label: service, value: service }));
      this.methodOptions = methods.map((method) => ({ label: method, value: method }));
    } catch {
      this.errorMessage = 'Error de conexión al consultar métricas.';
    } finally {
      this.loadingMetrics = false;
    }
  }

  get errorRate(): number {
    if (!this.summary.total_requests) return 0;
    return Number(((this.summary.total_error_status / this.summary.total_requests) * 100).toFixed(2));
  }

  methodSeverity(method: string): 'success' | 'info' | 'warn' | 'danger' {
    if (method === 'GET') return 'info';
    if (method === 'POST') return 'success';
    if (method === 'PATCH') return 'warn';
    return 'danger';
  }

  clearFilters(table: any): void {
    this.searchValue = '';
    this.selectedService = null;
    this.selectedMethod = null;
    table.clear();
  }
}
