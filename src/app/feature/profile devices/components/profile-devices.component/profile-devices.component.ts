import { Component, computed, DestroyRef, inject, signal, ViewChild } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Divider } from 'primeng/divider';
import { Toast } from 'primeng/toast';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';
import { DatePipe, NgClass } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { UserService } from '../../services/users.services';
import { ProfileDevices } from '../../interfaces/profile-devices.interface';
import { column } from '../../data/user.data';
import { Column } from '../../../../shared/layout/interfaces/Columns';
import { paramsGrid } from '../../../../shared/layout/interfaces/ParamsGrid';
import { DatagridComponent } from '../../../../shared/components/datagrid.component/datagrid.component';
import { UserRoleDialogComponent } from '../user-role-dialog/user-role-dialog.component';
import { UserProfilePanelComponent } from '../user-profile-panel/user-profile-panel.component';
import { buttonOptions } from '../../../../shared/Utils/buttonsOptions';
import { AuthService } from '../../../../shared/auth/auth.service';

@Component({
  selector: 'app-profile-devices.component',
  standalone: true,
  imports: [
    Divider,
    Toast,
    DatagridComponent,
    UserRoleDialogComponent,
    UserProfilePanelComponent,
    IconField,
    InputIcon,
    InputText,
    Button,
    Tooltip,
    FormsModule,
    DatePipe,
    NgClass,
  ],
  providers: [MessageService],
  templateUrl: './profile-devices.component.html',
  styleUrl: './profile-devices.component.css',
})
export class ProfileDevicesComponent {
  public readonly authService = inject(AuthService);
  private readonly msg = inject(MessageService);
  private readonly services = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild(DatagridComponent) datagrid?: DatagridComponent;

  public readonly data = signal<ProfileDevices[]>([]);
  public readonly totalRecords = signal<number>(0);
  public readonly loading = signal<boolean>(true);
  public readonly params = signal<paramsGrid | null | undefined>(undefined);
  public readonly column: Column[] = column;
  public readonly showActionDialog = signal<boolean>(false);
  public readonly showRoleDialog = signal<boolean>(false);
  public readonly showProfilePanel = signal<boolean>(false);
  public readonly selectedUser = signal<ProfileDevices | null>(null);

  // Filtros
  public readonly userTypeFilter = signal<string>('');
  public readonly isActiveFilter = signal<string>('');

  // Métricas
  public readonly totalUsersCount = computed(() => this.totalRecords() || this.data().length);
  public readonly activeUsersCount = computed(() => this.data().filter((u) => u.isActive).length);
  public readonly inactiveUsersCount = computed(() => this.data().filter((u) => !u.isActive).length);
  public readonly failedAttemptsUsersCount = computed(
    () => this.data().filter((u) => (u.failedAttempts || 0) > 0).length
  );

  public readonly filterParams = computed(() => {
    const p: Record<string, any> = {};

    const userType = this.userTypeFilter();
    if (userType && userType.trim() !== '') {
      p['userType'] = userType.trim();
    }

    const isActiveStr = this.isActiveFilter();
    if (isActiveStr !== '') {
      p['isActive'] = isActiveStr === 'true';
    }

    return p;
  });

  onFilterChange() {
    this.datagrid?.onFilterChange();
  }

  limpiarFiltros() {
    this.userTypeFilter.set('');
    this.isActiveFilter.set('');
    this.onFilterChange();
  }

  public readonly buttonsOptions: buttonOptions[] = [
    {
      icon: 'pi pi-user text-sky-400 opacity-90',
      tooltip: 'Ver Perfil, Accesos y MFA',
      action: (user: ProfileDevices) => {
        this.selectedUser.set(user);
        this.showProfilePanel.set(true);
      },
    },
    {
      icon: 'pi pi-user-edit text-[#9D72FF] opacity-90',
      tooltip: 'Asignar / Desasignar Rol',
      action: (user: ProfileDevices) => {
        this.selectedUser.set(user);
        this.showRoleDialog.set(true);
      },
    },
  ];

  onRoleAssigned(): void {
    this.loadUser();
  }

  OnParamsGrid(params: paramsGrid | null | undefined): void {
    this.params.set(params);
    if (params) this.loadUser();
  }

  loadUser() {
    this.loading.set(true);
    this.services
      .LoadUsers(this.params() ?? undefined)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.data.set(response.data);
          this.totalRecords.set(response.totalRecords);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.msg.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message || 'Error al cargar los usuarios',
          });
        },
      });
  }
}
