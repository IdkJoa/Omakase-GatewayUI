import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RolesComponent } from './roles.component';
import { RolesService } from '../../services/roles.service';
import { AuthService } from '../../../../shared/auth/auth.service';
import { ANIMATION_MODULE_TYPE } from '@angular/core';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { Role, User } from '../../interfaces/roles.interface';

describe('RolesComponent', () => {
  let component: RolesComponent;
  let fixture: ComponentFixture<RolesComponent>;
  let rolesServiceMock: any;
  let authServiceMock: any;

  const mockRoles: Role[] = [
    { id: '1', name: 'ADMIN', description: 'Admin role', createdAt: '2026-01-01', usersCount: 5 },
    { id: '2', name: 'GUEST', description: 'Guest role', createdAt: '2026-01-01', usersCount: 0 },
  ];

  const mockUsers: User[] = [
    { id: 'u1', username: 'john', userType: 'ADMIN', isActive: true, roles: ['1'] }
  ];

  beforeEach(async () => {
    rolesServiceMock = {
      getRoles: vi.fn().mockReturnValue(of(mockRoles)),
      getUsers: vi.fn().mockReturnValue(of({ data: mockUsers, page: 1, pageSize: 10, totalRecords: 1 })),
      getUserRoles: vi.fn().mockReturnValue(of([mockRoles[0]])),
      deleteRole: vi.fn().mockReturnValue(of(null)),
      assignRoleToUser: vi.fn().mockReturnValue(of(null)),
      revokeRoleFromUser: vi.fn().mockReturnValue(of(null)),
    };

    authServiceMock = {
      isAdmin: true,
      isViewer: false,
    };

    await TestBed.configureTestingModule({
      imports: [RolesComponent],
      providers: [
        { provide: ANIMATION_MODULE_TYPE, useValue: 'NoopAnimations' },
        { provide: RolesService, useValue: rolesServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RolesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. should create roles component', () => {
    expect(component).toBeTruthy();
  });

  it('2. should calculate totalRoles, totalAssignedUsers, rolesWithoutUsersCount, and mostPopularRole computed values', () => {
    component.roles.set(mockRoles);

    expect(component.totalRoles()).toBe(2);
    expect(component.totalAssignedUsers()).toBe(5);
    expect(component.rolesWithoutUsersCount()).toBe(1);
    expect(component.mostPopularRole()).toEqual({ name: 'ADMIN', count: 5 });
  });

  it('3. should filter roles accurately by search term', () => {
    component.roles.set(mockRoles);
    component.searchTerm.set('GUEST');

    expect(component.filteredRoles().length).toBe(1);
    expect(component.filteredRoles()[0].name).toBe('GUEST');
  });

  it('4. should filter roles accurately by filterType with_users and no_users', () => {
    component.roles.set(mockRoles);

    component.filterType.set('with_users');
    expect(component.filteredRoles().length).toBe(1);

    component.filterType.set('no_users');
    expect(component.filteredRoles().length).toBe(1);
  });

  it('5. should open create role dialog', () => {
    component.selectedRole.set(mockRoles[0]);
    component.openCreate();

    expect(component.selectedRole()).toBeNull();
    expect(component.showActionDialog()).toBe(true);
  });

  it('6. should open edit role dialog with selected role', () => {
    component.openEdit(mockRoles[0]);

    expect(component.selectedRole()).toEqual(mockRoles[0]);
    expect(component.showActionDialog()).toBe(true);
  });

  it('7. should clear search term and filterType on limpiarFiltros', () => {
    component.searchTerm.set('test');
    component.filterType.set('with_users');

    component.limpiarFiltros();

    expect(component.searchTerm()).toBe('');
    expect(component.filterType()).toBe('all');
  });

  it('8. should load user assigned roles when user is selected', () => {
    component.onUserSelect('u1');

    expect(rolesServiceMock.getUserRoles).toHaveBeenCalledWith('u1');
    expect(component.selectedUserRoles()).toEqual(['1']);
  });

  it('9. should trigger confirmation and delete role on accept', () => {
    const msgSpy = vi.spyOn((component as any).msg, 'add');
    const confirmSpy = vi.spyOn((component as any).confirmation, 'confirm').mockImplementation((opt: any) => {
      opt.accept();
      return (component as any).confirmation;
    });

    component.onDeleteRole(mockRoles[0]);

    expect(confirmSpy).toHaveBeenCalled();
    expect(rolesServiceMock.deleteRole).toHaveBeenCalledWith('1');
    expect(msgSpy).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Éxito',
      detail: "Rol 'ADMIN' eliminado correctamente.",
    });
  });

  it('10. should handle saving role assignments when roles are added or removed', () => {
    const msgSpy = vi.spyOn((component as any).msg, 'add');
    component.selectedUserId.set('u1');
    (component as any).initialUserRoles = ['1'];
    component.selectedUserRoles.set(['1', '2']); // Added role 2

    component.saveAssignments();

    expect(rolesServiceMock.assignRoleToUser).toHaveBeenCalledWith('u1', '2');
    expect(msgSpy).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Roles de usuario actualizados correctamente.',
    });
  });
});
