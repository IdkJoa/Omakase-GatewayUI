import { Component, input, output, signal } from '@angular/core';
import { Services } from '../../interfaces/services-protected.interface';
import { paramsGrid } from '../../../../shared/layout/interfaces/ParamsGrid';
import { Column } from '../../../../shared/layout/interfaces/Columns';
import { buttonOptions } from '../../../../shared/Utils/buttonsOptions';
import { getColumnWidth } from '../../../../shared/Utils/function.datagrid';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { Popover } from "primeng/popover";
import { Tooltip } from "primeng/tooltip";
import { FormsModule } from '@angular/forms';
import { Button } from "primeng/button";

@Component({
  selector: 'app-datagrid-services',
  imports: [Popover, Tooltip, TableModule, FormsModule, Button],
  templateUrl: './Datagrid.components.html',
  styleUrl: './Datagrid.components.css',
})
export class DatagridComponents {
  public readonly data = input.required<Services[]>();
  public readonly totalRecords = input.required<number>();
  public readonly loading = input.required<boolean>();
  public readonly paramsGrid = output<paramsGrid>();
  public readonly columns = input.required<Column[]>();
  private currentPage = 1;
  private currentLimit = 20;
  public readonly buttonOptions = input.required<buttonOptions[]>();
  public readonly selectedServices = signal<Services | null>(null);

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
    if (type !== "") {
      Params['isActive'] = type === 'true';
    }
    this.paramsGrid.emit(Params);
  }

  limpiarFiltros() {
    this.typeSelected.set("");
    this.onFilterChange();
  }

  FormattedStatus(bool: boolean, col: string) {
    if(col === "status"){
      return bool ? "Activo" : "Inactivo";
    }
    return bool ? "Requerido" : "No requerido"
  }
}
