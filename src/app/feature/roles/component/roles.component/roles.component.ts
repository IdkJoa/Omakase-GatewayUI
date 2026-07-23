import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Dialog } from 'primeng/dialog';
import { Divider } from 'primeng/divider';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { Toast } from 'primeng/toast';
import { forkJoin, Observable } from 'rxjs';
import { Role, User } from '../../interfaces/roles.interface';
import { RolesService } from '../../services/roles.service';
@Component({
  selector: 'app-roles',
  imports: [
    Divider,
    Toast,
    ConfirmDialog,
    TableModule,
    Dialog,
    Button,
    InputText,
    Select,
    Checkbox,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.css',
})
export class RolesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly msg = inject(MessageService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly rolesService = inject(RolesService);
  private readonly destroyRef = inject(DestroyRef);

  // States
  public readonly roles = signal<Role[]>([]);
  public readonly users = signal<User[]>([]);
  public readonly loadingRoles = signal<boolean>(false);
  public readonly loadingUsers = signal<boolean>(false);

  // Dialog state
  public readonly showCreateDialog = signal<boolean>(false);

  // Assignment states
  public selectedUserId = signal<string | null>(null);
  public selectedUserRoles = signal<string[]>([]); // Array of Role IDs assigned to selected user
  private initialUserRoles: string[] = []; // Cache to determine differences on save
  public readonly savingAssignments = signal<boolean>(false);

  // Create role form
  public readonly createRoleForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    description: ['', [Validators.maxLength(200)]]
  });

  ngOnInit(): void {
    this.loadRoles();
    this.loadUsers();
  }

  loadRoles(): void {
    this.loadingRoles.set(true);
    this.rolesService.getRoles()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.roles.set(data);
          this.loadingRoles.set(false);
        },
        error: (err) => {
          this.loadingRoles.set(false);
          this.msg.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message || 'Error al cargar los roles.'
          });
        }
      });
  }

  loadUsers(): void {
    this.loadingUsers.set(true);
    this.rolesService.getUsers(1, 100)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.users.set(res.data);
          this.loadingUsers.set(false);
        },
        error: (err) => {
          this.loadingUsers.set(false);
          this.msg.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message || 'Error al cargar los usuarios.'
          });
        }
      });
  }

  onUserSelect(userId: string | null): void {
    if (!userId) {
      this.selectedUserRoles.set([]);
      this.initialUserRoles = [];
      return;
    }

    this.rolesService.getUserRoles(userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (userRoles) => {
          const roleIds = userRoles.map(r => r.id);
          this.selectedUserRoles.set(roleIds);
          this.initialUserRoles = [...roleIds];
        },
        error: (err) => {
          this.msg.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message || 'Error al obtener roles del usuario.'
          });
        }
      });
  }

  openCreateDialog(): void {
    this.createRoleForm.reset();
    this.showCreateDialog.set(true);
  }

  onCreateRole(): void {
    if (this.createRoleForm.invalid) {
      this.createRoleForm.markAllAsTouched();
      return;
    }

    const payload = {
      name: this.createRoleForm.value.name!,
      description: this.createRoleForm.value.description || undefined
    };

    this.rolesService.createRole(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.msg.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `Rol '${payload.name}' creado correctamente.`
          });
          this.showCreateDialog.set(false);
          this.loadRoles();
        },
        error: (err) => {
          this.msg.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message || 'Error al crear el rol.'
          });
        }
      });
  }

  onDeleteRole(role: Role): void {
    this.confirmation.confirm({
      message: `¿Estás seguro de eliminar el rol '${role.name}'? Esta acción no se puede deshacer.`,
      header: 'Confirmación de Eliminación',
      icon: 'pi pi-exclamation-triangle text-amber-500',
      accept: () => {
        this.rolesService.deleteRole(role.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.msg.add({
                severity: 'success',
                summary: 'Éxito',
                detail: `Rol '${role.name}' eliminado.`
              });
              this.loadRoles();
            },
            error: (err) => {
              this.msg.add({
                severity: 'error',
                summary: 'Error',
                detail: err.error?.message || 'Error al eliminar el rol.'
              });
            }
          });
      }
    });
  }

  saveAssignments(): void {
    const userId = this.selectedUserId();
    if (!userId) return;

    this.savingAssignments.set(true);
    const current = this.selectedUserRoles();
    const added = current.filter(id => !this.initialUserRoles.includes(id));
    const removed = this.initialUserRoles.filter(id => !current.includes(id));

    const requests: Observable<void>[] = [];

    // Asignar nuevos roles
    added.forEach(roleId => {
      requests.push(this.rolesService.assignRoleToUser(userId, roleId));
    });

    // Revocar roles quitados
    removed.forEach(roleId => {
      requests.push(this.rolesService.revokeRoleFromUser(userId, roleId));
    });

    if (requests.length === 0) {
      this.savingAssignments.set(false);
      this.msg.add({
        severity: 'info',
        summary: 'Sin cambios',
        detail: 'No se realizaron modificaciones en los roles del usuario.'
      });
      return;
    }

    forkJoin(requests)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.msg.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Roles de usuario actualizados correctamente.'
          });
          this.savingAssignments.set(false);
          this.initialUserRoles = [...current];
          this.loadRoles(); // Recargar roles para actualizar contadores de usuarios
        },
        error: (err) => {
          this.savingAssignments.set(false);
          this.msg.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message || 'Error al guardar asignaciones de roles.'
          });
        }
      });
  }
}
