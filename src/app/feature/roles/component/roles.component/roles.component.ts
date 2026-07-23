import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
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
import { PopoverModule } from 'primeng/popover';
import { Tooltip } from 'primeng/tooltip';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { NgClass, DecimalPipe } from '@angular/common';
import { forkJoin, Observable } from 'rxjs';
import { Role, User } from '../../interfaces/roles.interface';
import { RolesService } from '../../services/roles.service';
import { Column } from '../../../../shared/layout/interfaces/Columns';
import { ROLES_COLUMN } from '../../data/data';
import { buttonOptions } from '../../../../shared/Utils/buttonsOptions';
import { RolesFormComponent } from '../roles-form.component/roles-form.component';

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
    ReactiveFormsModule,
    PopoverModule,
    Tooltip,
    IconField,
    InputIcon,
    NgClass,
    DecimalPipe,
    RolesFormComponent
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

  // UI state from teammates
  public readonly showActionDialog = signal<boolean>(false);
  public readonly selectedRole = signal<Role | null>(null);
  public readonly searchTerm = signal<string>('');
  public readonly filterType = signal<'all' | 'with_users' | 'no_users'>('all');
  public readonly viewMode = signal<'grid' | 'table'>('grid');
  public readonly column: Column[] = ROLES_COLUMN;

  // Assignment states (HU-027)
  public selectedUserId = signal<string | null>(null);
  public selectedUserRoles = signal<string[]>([]); // Array of Role IDs assigned to selected user
  private initialUserRoles: string[] = []; // Cache to determine differences on save
  public readonly savingAssignments = signal<boolean>(false);

  // Computed metrics based on the roles list
  public readonly totalRoles = computed(() => this.roles().length);
  public readonly totalAssignedUsers = computed(() =>
    this.roles().reduce((acc, r) => acc + (r.usersCount || 0), 0)
  );
  public readonly rolesWithoutUsersCount = computed(() =>
    this.roles().filter((r) => (r.usersCount || 0) === 0).length
  );
  public readonly mostPopularRole = computed(() => {
    const list = this.roles();
    if (!list.length) return { name: 'N/A', count: 0 };
    const maxRole = list.reduce(
      (max, r) => ((r.usersCount || 0) > (max.usersCount || 0) ? r : max),
      list[0]
    );
    return {
      name: (maxRole.usersCount || 0) > 0 ? maxRole.name : 'N/A',
      count: maxRole.usersCount || 0,
    };
  });

  // Filtered Roles List for display
  public readonly filteredRoles = computed(() => {
    let result = this.roles();

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

  limpiarFiltros(): void {
    this.searchTerm.set('');
    this.filterType.set('all');
  }

  openCreate(): void {
    this.selectedRole.set(null);
    this.showActionDialog.set(true);
  }

  openEdit(role: Role): void {
    this.selectedRole.set(role);
    this.showActionDialog.set(true);
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
                detail: `Rol '${role.name}' eliminado correctamente.`
              });
              this.loadRoles();
            },
            error: (err) => {
              this.msg.add({
                severity: 'error',
                summary: 'Error',
                detail: err.error?.message || 'Error al eliminar el rol. Verifique que no tenga usuarios asociados.'
              });
            }
          });
      }
    });
  }

  onRoleSaved(): void {
    this.loadRoles();
  }

  saveAssignments(): void {
    const userId = this.selectedUserId();
    if (!userId) return;

    this.savingAssignments.set(true);
    const current = this.selectedUserRoles();
    const added = current.filter(id => !this.initialUserRoles.includes(id));
    const removed = this.initialUserRoles.filter(id => !current.includes(id));

    const requests: Observable<void>[] = [];

    // Assign new roles
    added.forEach(roleId => {
      requests.push(this.rolesService.assignRoleToUser(userId, roleId));
    });

    // Revoke removed roles
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
          this.loadRoles(); // Reload roles to update active counts
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
