import { Component, input, output, signal } from '@angular/core';
import { Logs_Data } from '../../interface/logs.interfaces';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { DrawerModule } from 'primeng/drawer';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { InputIcon } from 'primeng/inputicon';
import { IconField } from 'primeng/iconfield';
import { getVerdictColor, getRiskColor, getColumnWidth } from '../../../../shared/Utils/function.datagrid';
import { paramsGrid } from '../../../../shared/layout/interfaces/ParamsGrid';
import { Column } from '../../../../shared/layout/interfaces/Columns';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { DatePipe } from '@angular/common';
import { PanelComponent } from '../panel.component/panel.component';
import { Tooltip } from 'primeng/tooltip';

@Component({
  standalone: true,
  selector: 'app-datagrid',
  imports: [
    TableModule,
    DatePipe,
    DrawerModule,
    InputIcon,
    Select,
    FormsModule,
    DatePicker,
    Button,
    IconField,
    InputText,
    PanelComponent,
    Tooltip,
  ],
  templateUrl: './datagrid.component.html',
  styleUrls: ['./datagrid.component.css'],
})
export class DatagridComponent {
  public readonly data = input.required<Logs_Data[]>();
  public readonly totalRecords = input.required<number>();
  public readonly loading = input.required<boolean>();
  public paramsGrid = output<paramsGrid>();
  public readonly columns = input.required<Column[]>();
  private currentPage = 1;
  private currentLimit = 20;

  //Estados para filtros
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

  getColumnWidth = getColumnWidth;
  getVerdictColor = getVerdictColor;
  getRiskColor = getRiskColor;

  onTableLazyLoad(event: TableLazyLoadEvent) {
    this.currentLimit = event.rows ?? 20;
    const firts = event.first ?? 0;

    this.currentPage = Math.floor(firts / this.currentLimit) + 1;

    this.onParamsGrid();
  }

  onFilterChange() {
    this.currentPage = 1;
    this.onParamsGrid();
  }

  onParamsGrid() {
    const Params: paramsGrid = {
      page: this.currentPage,
      pageSize: this.currentLimit,
      sourceIp: this.selectedIp(),
    };

    const verdict = this.selectedVerdict();
    if (verdict) {
      Params['verdict'] = verdict;
    }

    const search = this.globalSearch();
    if (search) Params['serviceName'] = search;

    const dates = this.selecetedDateRange();
    if (dates && dates.length === 2) {
      if (dates[0]) Params['from'] = dates[0].toISOString();
      if (dates[1]) Params['to'] = dates[1].toISOString();
    }
    this.paramsGrid.emit(Params);
  }

  limpiarFiltros() {
    this.selectedVerdict.set(null);
    this.selecetedDateRange.set(null);
    this.globalSearch.set('');
    this.selectedIp.set('');
    this.onFilterChange();
  }

  onPanelClosed() {
    setTimeout(() => this.logSelected.set(null), 300);
  }

  abrirDetalles(log: Logs_Data) {
    this.drawerVisible.set(true);
    this.logSelected.set(log);
  }
}
