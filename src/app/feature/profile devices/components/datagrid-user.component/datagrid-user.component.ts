import { Component, input, output, signal } from '@angular/core';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ProfileDevices } from '../../interfaces/profile-devices.interface';
import { paramsGrid } from '../../../../shared/layout/interfaces/ParamsGrid';
import { Column } from '../../../../shared/layout/interfaces/Columns';
import { getColumnWidth } from '../../../../shared/Utils/function.datagrid';
import { DatePipe, NgClass } from '@angular/common';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { PopoverModule } from 'primeng/popover';
import { Tooltip } from 'primeng/tooltip';
import { buttonOptions } from '../../../../shared/Utils/buttonsOptions';

@Component({
  selector: 'app-datagrid-user',
  standalone: true,
  imports: [
    TableModule,
    PopoverModule,
    Tooltip,
    DatePipe,
    NgClass,
    IconField,
    InputIcon,
    InputText,
    FormsModule,
    Button,
  ],
  templateUrl: './datagrid-user.component.html',
  styleUrl: './datagrid-user.component.css',
})
export class DatagridUserComponent {
  public readonly data = input.required<ProfileDevices[]>();
  public readonly totalRecords = input.required<number>();
  public readonly loading = input.required<boolean>();
  public readonly columns = input.required<Column[]>();
  public readonly buttonOptions = input<buttonOptions[]>([]);
  public readonly paramsGrid = output<paramsGrid>();

  private currentPage = 1;
  private currentLimit = 20;

  public readonly selectedUser = signal<ProfileDevices | null>(null);

  // Filter signals
  public readonly userTypeFilter = signal<string>('');
  public readonly isActiveFilter = signal<string>('');

  public getColumnWidth = getColumnWidth;

  onTableLazyLoad(event: TableLazyLoadEvent) {
    this.currentLimit = event.rows ?? 20;
    const first = event.first ?? 0;

    this.currentPage = Math.floor(first / this.currentLimit) + 1;

    this.onParamsGrid();
  }

  onFilterChange() {
    this.currentPage = 1;
    this.onParamsGrid();
  }

  onParamsGrid() {
    const params: paramsGrid = {
      page: this.currentPage,
      pageSize: this.currentLimit,
    };

    const userType = this.userTypeFilter();
    if (userType && userType.trim() !== '') {
      params['userType'] = userType.trim();
    }

    const isActiveStr = this.isActiveFilter();
    if (isActiveStr !== '') {
      params['isActive'] = isActiveStr === 'true';
    }

    this.paramsGrid.emit(params);
  }

  limpiarFiltros() {
    this.userTypeFilter.set('');
    this.isActiveFilter.set('');
    this.onFilterChange();
  }
}

