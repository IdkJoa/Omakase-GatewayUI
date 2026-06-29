import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Divider } from "primeng/divider"
import { ToastModule } from 'primeng/toast';
import { SystemHealthComponent } from "../system-health.component/system-health.component";
import { DashboardService } from '../../services/dashboard.services';
import { Metrics } from '../../interfaces/dashboard.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmationService, MessageService } from 'primeng/api';
import { LogsService } from '../../../audit forense/services/logs.services';
import { Logs_Data } from '../../../audit forense/interface/logs.interfaces';
import { LogsRealtimeComponent } from "../logs-realtime.component/logs-realtime.component";
import { paramsGrid } from '../../../../shared/layout/interfaces/ParamsGrid';
@Component({
  selector: 'app-dashboard.component',
  imports: [Divider, SystemHealthComponent, ToastModule,  LogsRealtimeComponent],
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
    const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const params: paramsGrid = {
      page: "1",
      pageSize: "5",
      to: now.toISOString(),
      from: twentyFourHoursAgo.toISOString(),
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
    const params: paramsGrid = {
      page: "1",
      pageSize: "5",
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
