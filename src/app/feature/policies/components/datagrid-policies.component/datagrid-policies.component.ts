import { Component, input,  output, signal } from '@angular/core';
import { TableLazyLoadEvent, TableModule } from "primeng/table";
import { Policies } from '../../interfaces/policies.interface';
import { paramsGrid } from '../../../../shared/layout/interfaces/ParamsGrid';
import { Column } from '../../../../shared/layout/interfaces/Columns';
import { getColumnWidth, getConditionText } from '../../../../shared/Utils/function.datagrid';
import { DecimalPipe } from '@angular/common';
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import { InputText } from "primeng/inputtext";
import { FormsModule } from '@angular/forms';
import { Button } from "primeng/button";
import { PopoverModule } from 'primeng/popover';
import { Tooltip } from 'primeng/tooltip';
import { buttonOptions } from '../../../../shared/Utils/buttonsOptions';

@Component({
  selector: 'app-datagrid-policies',
  imports: [TableModule, PopoverModule, DecimalPipe, IconField, InputIcon, InputText, FormsModule, Button, Tooltip],
  templateUrl: './datagrid-policies.component.html',
  styleUrl: './datagrid-policies.component.css',
})
export class DatagridPoliciesComponent {
  public readonly data = input.required<Policies[]>();
  public readonly totalRecords = input.required<number>();
  public readonly loading = input.required<boolean>();
  public readonly paramsGrid = output<paramsGrid>();
  public readonly columns = input.required<Column[]>();
  private currentPage = 1;
  private currentLimit = 20;
  public readonly buttonOptions = input.required<buttonOptions[]>();
  public readonly selectedPolicies = signal<Policies | null>(null);

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

  getConditionText = getConditionText;

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
