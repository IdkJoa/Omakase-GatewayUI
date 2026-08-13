import { Component, input, output, contentChild, TemplateRef } from '@angular/core';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { Column } from '../../layout/interfaces/Columns';
import { paramsGrid } from '../../layout/interfaces/ParamsGrid';
import { getColumnWidth } from '../../Utils/function.datagrid';
import { NgTemplateOutlet, CommonModule } from '@angular/common';

@Component({
  selector: 'app-datagrid',
  standalone: true,
  imports: [TableModule, NgTemplateOutlet, CommonModule],
  templateUrl: './datagrid.component.html',
  styleUrl: './datagrid.component.css',
})
export class DatagridComponent<T  = Record<string, unknown>> {
  public readonly data = input<T[]>([]);
  public readonly totalRecords = input<number>(0);
  public readonly loading = input<boolean>(false);
  public readonly columns = input.required<Column[]>();
  public readonly paginator = input<boolean>(true);
  public readonly lazy = input<boolean>(true);
  public readonly rows = input<number>(20);
  public readonly rowsPerPageOptions = input<number[]>([5, 10, 20, 50]);
  public readonly scrollable = input<boolean>(true);
  public readonly scrollHeight = input<string>('600px');
  public readonly showActions = input<boolean>(true);
  public readonly actionsHeader = input<string>('ACCIONES');
  public readonly actionsWidth = input<string>('5%');
  public readonly emptyMessage = input<string>('No se encontraron registros.');
  public readonly tableStyle = input<Record<string, string>>({ 'min-width': '50rem' });
  public readonly extraParams = input<Record<string, unknown>>({});

  public readonly paramsGrid = output<paramsGrid>();
  public readonly lazyLoad = output<TableLazyLoadEvent>();

  public readonly bodyTemplate = contentChild<TemplateRef<any>>('bodyTemplate');

  public firstRow = 0;
  private currentPage = 1;
  private currentLimit = 20;

  getColumnWidth = getColumnWidth;

  onTableLazyLoad(event: TableLazyLoadEvent) {
    this.currentLimit = event.rows ?? this.rows();
    const first = event.first ?? 0;

    this.currentPage = Math.floor(first / this.currentLimit) + 1;

    this.lazyLoad.emit(event);
    this.emitParamsGrid();
  }

  onFilterChange() {
    this.currentPage = 1;
    this.firstRow = 0;
    this.emitParamsGrid();
  }

  emitParamsGrid() {
    if (!this.lazy()) return;

    const params: paramsGrid = {
      page: this.currentPage,
      pageSize: this.currentLimit,
      ...this.extraParams(),
    };

    this.paramsGrid.emit(params);
  }
}
