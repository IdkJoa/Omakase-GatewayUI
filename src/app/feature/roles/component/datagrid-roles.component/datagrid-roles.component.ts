import { Component, input, signal } from '@angular/core';
import { RolesResponse } from '../../interfaces/roles.interface';
import { Column } from '../../../../shared/layout/interfaces/Columns';
import { buttonOptions } from '../../../../shared/Utils/buttonsOptions';
import { getColumnWidth } from '../../../../shared/Utils/function.datagrid';
import { TableModule } from "primeng/table";
import { FormsModule } from '@angular/forms';
import { Popover } from "primeng/popover";
import { Tooltip } from "primeng/tooltip";


@Component({
  selector: 'app-datagrid-roles',
  imports: [TableModule, FormsModule, Popover, Tooltip],
  templateUrl: './datagrid-roles.component.html',
  styleUrl: './datagrid-roles.component.css',
})
export class DatagridRolesComponent {
  public readonly data = input.required<RolesResponse[]>();
  public readonly loading = input.required<boolean>();
  public readonly columns = input.required<Column[]>();
  public readonly buttonsOptions = input.required<buttonOptions[]>();
  public readonly selectedRole = signal<RolesResponse | null>(null);
  public getColumnWidth = getColumnWidth;

}
