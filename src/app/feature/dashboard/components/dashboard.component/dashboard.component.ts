import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Divider } from "primeng/divider"
import { ToastModule } from 'primeng/toast';
import { SystemHealthComponent } from "../system-health.component/system-health.component";
import { DashboardService } from '../../services/dashboard.services';
import { Metrics } from '../../interfaces/dashboard.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableLogComponent } from "../table_log.component/table_log.component";
import { LogsService } from '../../../audit forense/services/logs.services';
import { Logs_Data } from '../../../audit forense/interface/logs.interfaces';
import { LogsRealtimeComponent } from "../logs-realtime.component/logs-realtime.component";

@Component({
  selector: 'app-dashboard.component',
  imports: [Divider, SystemHealthComponent, ToastModule, TableLogComponent, LogsRealtimeComponent],
  providers: [ConfirmationService, MessageService],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private dashboardServices = inject(DashboardService);
  private msg = inject(MessageService);
  public metrics = signal<Metrics | null>(null);
  private destroyRef = inject(DestroyRef);
  private logsServices = inject(LogsService);
  public logs = signal<Logs_Data[]>([]);
  public logsLive = signal<Logs_Data[]>([]);

  getMetrics() {
    return this.dashboardServices.getMetrics().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.metrics.set(response);
      },
      error: (err) => {
        this.msg.add({ severity: "error", summary: "Error", detail: err.error?.message || "Error al cargar data de Traffic Disposition" })
      }
    })
  }

  getLogsMetrics() {
    const params: Record<string, string | readonly string[]> = {
      page: "1",
      pageSize: "5",
      from: "2026-06-24 00:00:00",
      to: "2026-06-30 00:00:00"
    }

    return this.logsServices.getLogs(params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.logs.set(response.data);
      },
      error: (err) => {
        this.msg.add({ severity: "error", summary: "Error", detail: err.error?.message || "Error al cargar logs" });
      }
    })
  }

  getLogs() {
    const params: Record<string, string | readonly string[]> = {
      page: "1",
      pageSize: "5",
      from: "2026-06-24 00:00:00",
      to: "2026-06-30 00:00:00"
    }

    return this.logsServices.getLogs(params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.logsLive.set(response.data);
      },
      error: (err) => {
        this.msg.add({ severity: "error", summary: "Error", detail: err.error?.message || "Error al cargar logs" });
      }
    })
  }

  ngOnInit(): void {
    this.getMetrics();
    this.getLogs();
    this.getLogsMetrics();
  }
}
