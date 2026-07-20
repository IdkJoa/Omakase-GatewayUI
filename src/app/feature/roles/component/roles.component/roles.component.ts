import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Divider } from 'primeng/divider';
import { Toast } from 'primeng/toast';
import { Button } from 'primeng/button';
import { PopoverModule } from 'primeng/popover';
import { Tooltip } from 'primeng/tooltip';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { DatagridComponent } from '../../../../shared/components/datagrid.component/datagrid.component';
import { RolesResponse } from '../../interfaces/roles.interface';
import { RolesService } from '../../services/roles.services';
import { Column } from '../../../../shared/layout/interfaces/Columns';
import { ROLES_COLUMN } from '../../data/data';
import { buttonOptions } from '../../../../shared/Utils/buttonsOptions';
import { RolesFormComponent } from '../roles-form.component/roles-form.component';
import { UserRoleDialogComponent } from '../../../profile devices/components/user-role-dialog/user-role-dialog.component';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    Divider,
    Toast,
    Button,
    DatagridComponent,
    PopoverModule,
    Tooltip,
    ConfirmDialog,
    IconField,
    InputIcon,
    InputText,
    FormsModule,
    NgClass,
    RolesFormComponent,
    UserRoleDialogComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.css',
})
export class RolesComponent implements OnInit {
  private readonly msg = inject(MessageService);
  private readonly confirmation = inject(ConfirmationService);
  public readonly data = signal<RolesResponse[]>([]);
  public readonly loading = signal<boolean>(false);
  private readonly services = inject(RolesService);
  private readonly destroyRef = inject(DestroyRef);
  public readonly column: Column[] = ROLES_COLUMN;
  public readonly showActionDialog = signal<boolean>(false);
  public readonly showUserRoleDialog = signal<boolean>(false);
  public readonly selectedRole = signal<RolesResponse | null>(null);
  public readonly isEditMode = computed(() => this.selectedRole() !== null);

  // Layout & Filtering signals
  public readonly searchTerm = signal<string>('');
  public readonly filterType = signal<'all' | 'with_users' | 'no_users'>('all');
  public readonly viewMode = signal<'grid' | 'table'>('grid');

  // Metrics
  public readonly totalRoles = computed(() => this.data().length);

  public readonly totalAssignedUsers = computed(() =>
    this.data().reduce((acc, r) => acc + (r.usersCount || 0), 0)
  );

  public readonly rolesWithoutUsersCount = computed(
    () => this.data().filter((r) => (r.usersCount || 0) === 0).length
  );

  public readonly mostPopularRole = computed(() => {
    const roles = this.data();
    if (!roles.length) return { name: 'N/A', count: 0 };
    const maxRole = roles.reduce(
      (max, r) => ((r.usersCount || 0) > (max.usersCount || 0) ? r : max),
      roles[0]
    );
    return {
      name: (maxRole.usersCount || 0) > 0 ? maxRole.name : 'N/A',
      count: maxRole.usersCount || 0,
    };
  });

  // Filtered Roles List
  public readonly filteredRoles = computed(() => {
    let result = this.data();

    const term = this.searchTerm().toLowerCase().trim();
    if (term) {
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(term) ||
          (r.description && r.description.toLowerCase().includes(term))
      );
    }

    const filter = this.filterType();
    if (filter === 'with_users') {
      result = result.filter((r) => (r.usersCount || 0) > 0);
    } else if (filter === 'no_users') {
      result = result.filter((r) => (r.usersCount || 0) === 0);
    }

    return result;
  });

  ngOnInit(): void {
    this.LoadRole();
  }

  LoadRole() {
    this.loading.set(true);
    this.services
      .LoadRoles()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.data.set(response);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.msg.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar los roles',
          });
        },
      });
  }

  limpiarFiltros(): void {
    this.searchTerm.set('');
    this.filterType.set('all');
  }

  buttonsOptions: buttonOptions[] = [
    {
      icon: 'pi pi-trash text-red-400 opacity-80',
      action: (role: RolesResponse) => this.openDelete(role),
      tooltip: 'Eliminar rol',
    },
    {
      icon: 'pi pi-pencil text-blue-400 opacity-80',
      action: (role: RolesResponse) => this.openEdit(role),
      tooltip: 'Editar rol',
    },
    {
      icon: 'pi pi-user-plus text-emerald-400 opacity-80',
      action: (role: RolesResponse) => this.openAssigment(role),
      tooltip: 'Asignar / Desasignar Usuarios',
    },
  ];

  openAssigment(role: RolesResponse) {
    this.selectedRole.set(role);
    this.showUserRoleDialog.set(true);
  }

  openCreate() {
    this.selectedRole.set(null);
    this.showActionDialog.set(true);
  }

  openEdit(role: RolesResponse) {
    this.selectedRole.set(role);
    this.showActionDialog.set(true);
  }

  openDelete(role: RolesResponse) {
    this.confirmation.confirm({
      message: `¿Estas seguro de eliminar el rol ${role.name}?`,
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle text-amber-400!',

      accept: () => {
        this.services.DeleteRol(role.id).subscribe({
          next: () => {
            this.msg.add({
              severity: 'success',
              summary: 'Eliminado',
              detail: 'Rol eliminado con exito',
            });
            this.LoadRole();
          },
          error: () => {
            this.msg.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar el rol',
            });
          },
        });
      },
    });
  }

  onRoleSaved(): void {
    this.LoadRole();
  }
}

