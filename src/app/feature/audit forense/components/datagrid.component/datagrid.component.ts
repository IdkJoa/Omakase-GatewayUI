import { Component, input, output, signal } from '@angular/core';
import { Logs_Data } from '../../interface/logs.interfaces';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { DrawerModule } from 'primeng/drawer';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { InputIcon } from 'primeng/inputicon';
import { IconField } from 'primeng/iconfield';
import {getVerdictColor, getRiskColor} from '../../../../shared/Utils/function.datagrid'
import { paramsGrid } from '../../../../shared/layout/interfaces/ParamsGrid';
import { Column } from '../../../../shared/layout/interfaces/Columns';
import { FormsModule } from "@angular/forms";
import { Button } from "primeng/button";
import { InputText } from "primeng/inputtext";
import { DatePipe } from '@angular/common';
import { PanelComponent } from "../panel.component/panel.component";

@Component({
  standalone: true,
  selector: 'app-datagrid',
  imports: [TableModule, DatePipe, DrawerModule, InputIcon, Select, FormsModule, DatePicker, Button, IconField, InputText, PanelComponent],
  templateUrl: './datagrid.component.html',
  styleUrls: ['./datagrid.component.css'],
})
export class DatagridComponent {
  data = input.required<Logs_Data[]>();
  totalRecords = input.required<number>();
  loading = input.required<boolean>();
  public paramsGrid = output<paramsGrid>();
  columns = input.required<Column[]>();
  filter = input.required<string[]>();
  private currentPage = 1;
  private currentLimit = 20;

  //Estados para filtros
  public selectedVerdict = signal<string | null>(null);
  public selecetedDateRange = signal<Date[] | null>(null);
  public globalSearch = signal<string>("");
  public selectedIp = signal<string>("");

  public verdictOptions = [
    { label: 'ALL', value: null },
    { label: 'ALLOW', value: 'ALLOW' },
    { label: 'BLOCK', value: 'BLOCK' },
    { label: 'CHALLENGE', value: 'CHALLENGE' }
  ];

  public drawerVisible = signal<boolean>(false);
  public logSelected = signal<Logs_Data | null>(null);

  public isFilterEnabled(field: string): boolean {
    return this.filter().includes(field);
  }

  public getColumnWidth(field: string): string {
    switch (field) {
      case 'timestamp':
        return '18%';
      case 'sourceIp':
        return '25%';
      case 'serviceName':
        return '22%';
      case 'verdict':
        return '12%';
      case 'triggeredRules':
        return '18%';
      default:
        return 'auto';
    }
  }

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
      sourceIp: this.selectedIp()
    };

    const verdict = this.selectedVerdict();
    if (verdict) {
      Params['verdict'] = verdict;
    }

    const search = this.globalSearch();
    if(search) Params["serviceName"] = search;

    const dates = this.selecetedDateRange();
    if(dates && dates.length === 2){
      if(dates[0]) Params["from"] = dates[0].toISOString();
      if(dates[1]) Params["to"] = dates[1].toISOString();
    }
    this.paramsGrid.emit(Params);
  }

  limpiarFiltros() {
    this.selectedVerdict.set(null);
    this.selecetedDateRange.set(null);
    this.globalSearch.set('');
    this.selectedIp.set("");
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
