import { Component, DestroyRef, inject, input, output, signal } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';

import { RolesService } from '../../../roles/services/roles.service';
import { UserService } from '../../services/users.services';
import { ProfileDevices } from '../../interfaces/profile-devices.interface';
import { Role } from '../../../roles/interfaces/roles.interface';

@Component({
  selector: 'app-user-role-dialog',
  standalone: true,
  imports: [
    Dialog,
    Button,
    Tooltip,
    FormsModule,
  ],
  templateUrl: './user-role-dialog.component.html',
  styleUrl: './user-role-dialog.component.css',
})
export class UserRoleDialogComponent {
  private readonly rolesService = inject(RolesService);
  private readonly userService = inject(UserService);
  private readonly msg = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  visible = input<boolean>(false);
  visibleChange = output<boolean>();
  saved = output<void>();

  user = input<ProfileDevices | null>(null);
  role = input<Role | null>(null);

  availableRoles = signal<Role[]>([]);
  availableUsers = signal<ProfileDevices[]>([]);

  selectedRoleId = signal<string>('');
  selectedUserId = signal<string>('');
  loadingAction = signal<boolean>(false);

  onShow(): void {
    this.selectedRoleId.set('');
    this.selectedUserId.set('');
    this.loadRoles();
    this.loadUsers();
  }

  loadRoles(): void {
    this.rolesService
      .getRoles()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (roles) => this.availableRoles.set(roles),
        error: () => {},
      });
  }

  loadUsers(): void {
    this.userService
      .LoadUsers({ page: 1, pageSize: 100 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.availableUsers.set(res.data),
        error: () => {},
      });
  }

  assignRoleToUser(): void {
    const u = this.user();
    const roleId = this.selectedRoleId();

    if (!u) return;
    if (!roleId) {
      this.msg.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Debe seleccionar un rol para asignar.',
      });
      return;
    }

    this.loadingAction.set(true);
    this.rolesService
      .assignRoleToUser(u.id, roleId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loadingAction.set(false);
          this.msg.add({
            severity: 'success',
            summary: 'Rol Asignado',
            detail: `Se asignó el rol al usuario ${u.username} correctamente.`,
          });
          this.selectedRoleId.set('');
          this.saved.emit();
        },
        error: (err: HttpErrorResponse) => {
          this.loadingAction.set(false);
          this.msg.add({
            severity: 'error',
            summary: 'Error',
            detail: err?.error?.message || 'Error al asignar el rol.',
          });
        },
      });
  }

  unassignRoleFromUser(roleNameOrId: string): void {
    const u = this.user();
    if (!u) return;

    const roleObj = this.availableRoles().find(
      (r) => r.name === roleNameOrId || r.id === roleNameOrId
    );
    const roleId = roleObj ? roleObj.id : roleNameOrId;

    this.loadingAction.set(true);
    this.rolesService
      .revokeRoleFromUser(u.id, roleId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loadingAction.set(false);
          this.msg.add({
            severity: 'success',
            summary: 'Rol Desasignado',
            detail: `Se quitó el rol del usuario ${u.username} correctamente.`,
          });
          this.saved.emit();
        },
        error: (err: HttpErrorResponse) => {
          this.loadingAction.set(false);
          this.msg.add({
            severity: 'error',
            summary: 'Error',
            detail: err?.error?.message || 'Error al desasignar el rol.',
          });
        },
      });
  }

  assignUserToRole(): void {
    const r = this.role();
    const userId = this.selectedUserId();

    if (!r) return;
    if (!userId) {
      this.msg.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Debe seleccionar un usuario para asignar.',
      });
      return;
    }

    this.loadingAction.set(true);
    this.rolesService
      .assignRoleToUser(userId, r.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loadingAction.set(false);
          this.msg.add({
            severity: 'success',
            summary: 'Usuario Asignado',
            detail: `Usuario asignado al rol ${r.name} con éxito.`,
          });
          this.selectedUserId.set('');
          this.saved.emit();
        },
        error: (err: HttpErrorResponse) => {
          this.loadingAction.set(false);
          this.msg.add({
            severity: 'error',
            summary: 'Error',
            detail: err?.error?.message || 'Error al asignar el usuario al rol.',
          });
        },
      });
  }

  unassignUserFromRole(): void {
    const r = this.role();
    const userId = this.selectedUserId();

    if (!r) return;
    if (!userId) {
      this.msg.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Debe seleccionar un usuario para desasignar.',
      });
      return;
    }

    this.loadingAction.set(true);
    this.rolesService
      .revokeRoleFromUser(userId, r.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loadingAction.set(false);
          this.msg.add({
            severity: 'success',
            summary: 'Usuario Desasignado',
            detail: `Usuario desasignado del rol ${r.name} con éxito.`,
          });
          this.selectedUserId.set('');
          this.saved.emit();
        },
        error: (err: HttpErrorResponse) => {
          this.loadingAction.set(false);
          this.msg.add({
            severity: 'error',
            summary: 'Error',
            detail: err?.error?.message || 'Error al desasignar el usuario del rol.',
          });
        },
      });
  }

  close(): void {
    this.visibleChange.emit(false);
  }
}
