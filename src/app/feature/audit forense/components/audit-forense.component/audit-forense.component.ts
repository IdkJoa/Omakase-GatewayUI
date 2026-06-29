import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Divider } from "primeng/divider"
import { ToastModule } from 'primeng/toast';
import { LogsService } from '../../services/logs.services';
import { Logs_Data } from '../../interface/logs.interfaces';
import { DatagridComponent } from "../datagrid.component/datagrid.component";
import { paramsGrid } from '../../../../shared/layout/interfaces/ParamsGrid';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Column } from '../../../../shared/layout/interfaces/Columns';
import { filter_logs, logs_Columns } from '../../data/logs.data';

@Component({
  selector: 'app-audit-forense.component',
  imports: [Divider, ToastModule, DatagridComponent],
  providers: [MessageService, ConfirmationService],
  templateUrl: './audit-forense.component.html',
  styleUrl: './audit-forense.component.css',
})
export class AuditForenseComponent implements OnInit{
  private servicesLogs = inject(LogsService);
  private destroyRef = inject(DestroyRef);
  private msg = inject(MessageService);
  logs = signal<Logs_Data[]>([]);
  totalRecord = signal<number>(0);
  loading = signal<boolean>(true);
  params = signal<paramsGrid | null | undefined>(undefined);
  columns: Column[] = logs_Columns;
  filter_logs: string[] = filter_logs;

  OnParamsGrid(params: paramsGrid | null | undefined): void {
    this.params.set(params);
    console.log(this.params())
    if (params) {
      this.getLogs();
    }
  }

  ngOnInit(): void {
    this.getLogs();
  }

  getLogs() {
    this.loading.set(true);
    this.servicesLogs.getLogs(this.params() ?? undefined).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (reponse) => {
        this.loading.set(false);
        this.logs.set(reponse.data);
        this.totalRecord.set(reponse.totalRecords);
      },
      error: (err) => {
        this.loading.set(false);
        this.msg.add({ severity: "error", summary: "Error", detail: err.error?.message || "Error al cargar logs" });
      }
    })
  }
}
