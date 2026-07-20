import { Component, DestroyRef, inject, OnInit, signal, ViewChild, computed } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Divider } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { LogsService } from '../../services/logs.services';
import { Logs_Data } from '../../interface/logs.interfaces';
import { DatagridComponent } from '../../../../shared/components/datagrid.component/datagrid.component';
import { paramsGrid } from '../../../../shared/layout/interfaces/ParamsGrid';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Column } from '../../../../shared/layout/interfaces/Columns';
import { logs_Columns } from '../../data/logs.data';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Tooltip } from 'primeng/tooltip';
import { PanelComponent } from '../panel.component/panel.component';
import { getVerdictColor, getRiskColor } from '../../../../shared/Utils/function.datagrid';

@Component({
  selector: 'app-audit-forense.component',
  standalone: true,
  imports: [
    Divider,
    ToastModule,
    DatagridComponent,
    Select,
    DatePicker,
    IconField,
    InputIcon,
    InputText,
    Button,
    FormsModule,
    DatePipe,
    Tooltip,
    PanelComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './audit-forense.component.html',
  styleUrl: './audit-forense.component.css',
})
export class AuditForenseComponent implements OnInit {
  private readonly servicesLogs = inject(LogsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly msg = inject(MessageService);

  @ViewChild(DatagridComponent) datagrid?: DatagridComponent;

  public readonly logs = signal<Logs_Data[]>([]);
  public readonly totalRecord = signal<number>(0);
  public readonly loading = signal<boolean>(true);
  public readonly params = signal<paramsGrid | null | undefined>(undefined);
  public readonly columns: Column[] = logs_Columns;

  // Estados para filtros
  public readonly selectedVerdict = signal<string | null>(null);
  public readonly selecetedDateRange = signal<Date[] | null>(null);
  public readonly globalSearch = signal<string>('');
  public readonly selectedIp = signal<string>('');

  public readonly verdictOptions = [
    { label: 'ALL', value: null },
    { label: 'ALLOW', value: 'ALLOW' },
    { label: 'BLOCK', value: 'BLOCK' },
    { label: 'CHALLENGE', value: 'CHALLENGE' },
  ];

  public readonly drawerVisible = signal<boolean>(false);
  public readonly logSelected = signal<Logs_Data | null>(null);

  getVerdictColor = getVerdictColor;
  getRiskColor = getRiskColor;

  public readonly filterParams = computed(() => {
    const p: Record<string, any> = {};

    if (this.selectedIp()) {
      p['sourceIp'] = this.selectedIp();
    }

    const verdict = this.selectedVerdict();
    if (verdict) {
      p['verdict'] = verdict;
    }

    const search = this.globalSearch();
    if (search) {
      p['serviceName'] = search;
    }

    const dates = this.selecetedDateRange();
    if (dates && dates.length === 2) {
      if (dates[0]) p['from'] = dates[0].toISOString();
      if (dates[1]) p['to'] = dates[1].toISOString();
    }

    return p;
  });

  onFilterChange() {
    this.datagrid?.onFilterChange();
  }

  limpiarFiltros() {
    this.selectedVerdict.set(null);
    this.selecetedDateRange.set(null);
    this.globalSearch.set('');
    this.selectedIp.set('');
    this.onFilterChange();
  }

  abrirDetalles(log: Logs_Data) {
    this.drawerVisible.set(true);
    this.logSelected.set(log);
  }

  onPanelClosed() {
    setTimeout(() => this.logSelected.set(null), 300);
  }

  OnParamsGrid(params: paramsGrid | null | undefined): void {
    this.params.set(params);
    if (params) {
      this.getLogs();
    }
  }

  ngOnInit(): void {
    this.getLogs();
  }

  getLogs() {
    this.loading.set(true);
    this.servicesLogs
      .getLogs(this.params() ?? undefined)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (reponse) => {
          this.loading.set(false);
          this.logs.set(reponse.data);
          this.totalRecord.set(reponse.totalRecords);
        },
        error: (err) => {
          this.loading.set(false);
          this.msg.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message || 'Error al cargar logs',
          });
        },
      });
  }
}
