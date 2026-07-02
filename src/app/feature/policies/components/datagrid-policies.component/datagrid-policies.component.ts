import { Component, input,  output, signal } from '@angular/core';
import { TableLazyLoadEvent, TableModule } from "primeng/table";
import { Policies } from '../../interfaces/policies.interface';
import { paramsGrid } from '../../../../shared/layout/interfaces/ParamsGrid';
import { Column } from '../../../../shared/layout/interfaces/Columns';
import { getColumnWidth } from '../../../../shared/Utils/function.datagrid';
import { DecimalPipe } from '@angular/common';
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import { InputText } from "primeng/inputtext";
import { FormsModule } from '@angular/forms';
import { Button } from "primeng/button";

@Component({
  selector: 'app-datagrid-policies',
  imports: [TableModule, DecimalPipe, IconField, InputIcon, InputText, FormsModule, Button],
  templateUrl: './datagrid-policies.component.html',
  styleUrl: './datagrid-policies.component.css',
})
export class DatagridPoliciesComponent {
  data = input.required<Policies[]>();
  totalRecords = input.required<number>();
  loading = input.required<boolean>();
  public paramsGrid = output<paramsGrid>();
  columns = input.required<Column[]>();
  private currentPage = 1;
  private currentLimit = 20;

  public typeSelected = signal<string>("");
  public getColumnWidth = getColumnWidth;

  onTableLazyLoad(event: TableLazyLoadEvent){
    this.currentLimit = event.rows ?? 20;
    const first = event.first ?? 0;

    this.currentPage  = Math.floor(first/this.currentLimit) + 1;

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
    };

    const type = this.typeSelected();
    if(type) {
      Params['type'] = type;
    }
    this.paramsGrid.emit(Params);
  }

  limpiarFiltros() {
    this.typeSelected.set("");
    this.onFilterChange();
  }


  public getConditionText(policy: Policies): string {
    const cfg = policy.config;
    switch (policy.type) {
      case 'Geofence':
        return `Countries: ${cfg.allowedCountries?.join(', ')}`;
      case 'TimeWindow':
        return `${cfg.startHour}:00 - ${cfg.endHour}:00 (${cfg.daysOfWeek?.length} days)`;
      case 'ImpossibleTravel':
        return `Max Speed: ${cfg.maxSpeedKmh} km/h`;
      case 'Fingerprint':
        return `Max Devices: ${cfg.maxDevicesPerSession}`;
      default:
        return 'Custom Configuration';
    }
  }

  // 5. Utilidades de UI (Colores)
  public getTypeColor(type: string): string {
    const colors: Record<string, string> = {
      'Geofence': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
      'TimeWindow': 'text-purple-400 bg-purple-400/10 border-purple-400/20',
      'ImpossibleTravel': 'text-orange-400 bg-orange-400/10 border-orange-400/20',
      'Fingerprint': 'text-teal-400 bg-teal-400/10 border-teal-400/20'
    };
    return colors[type] || 'text-gray-400 bg-gray-400/10 border-gray-400/20';
  }

}
