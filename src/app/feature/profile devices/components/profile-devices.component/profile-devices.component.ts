import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Divider } from 'primeng/divider';
import { Toast } from 'primeng/toast';
import { UserService } from '../../services/users.services';
import { ProfileDevices } from '../../interfaces/profile-devices.interface';
import { column } from '../../data/user.data';
import { Column } from '../../../../shared/layout/interfaces/Columns';
import { paramsGrid } from '../../../../shared/layout/interfaces/ParamsGrid';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { DatagridUserComponent } from '../datagrid-user.component/datagrid-user.component';
import { UserRoleDialogComponent } from '../user-role-dialog/user-role-dialog.component';
import { buttonOptions } from '../../../../shared/Utils/buttonsOptions';

@Component({
  selector: 'app-profile-devices.component',
  imports: [Divider, Toast, DatagridUserComponent, UserRoleDialogComponent],
  providers: [MessageService],
  templateUrl: './profile-devices.component.html',
  styleUrl: './profile-devices.component.css',
})
export class ProfileDevicesComponent {
  private readonly msg = inject(MessageService);
  private readonly services = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);
  public readonly data = signal<ProfileDevices[]>([]);
  public readonly totalRecords = signal<number>(0);
  public readonly loading = signal<boolean>(true);
  public readonly params = signal<paramsGrid | null | undefined>(undefined);
  public readonly column: Column[] = column;
  public readonly showActionDialog = signal<boolean>(false);
  public readonly showRoleDialog = signal<boolean>(false);
  public readonly selectedUser = signal<ProfileDevices | null>(null);

  public readonly buttonsOptions: buttonOptions[] = [
    {
      icon: 'pi pi-[#9D72FF] pi-user-edit text-[#9D72FF] opacity-90',
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
    if(params)this.loadUser();
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
