import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileDevicesComponent } from './profile-devices.component';
import { UserService } from '../../services/users.services';
import { AuthService } from '../../../../shared/auth/auth.service';
import { ANIMATION_MODULE_TYPE } from '@angular/core';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { ProfileDevices } from '../../interfaces/profile-devices.interface';

describe('ProfileDevicesComponent', () => {
  let component: ProfileDevicesComponent;
  let fixture: ComponentFixture<ProfileDevicesComponent>;
  let userServiceMock: any;
  let authServiceMock: any;

  const mockUsers: ProfileDevices[] = [
    {
      id: '1',
      username: 'user1',
      userType: 'ADMIN',
      isActive: true,
      failedAttempts: 0,
      lockedUntil: null,
      createdAt: new Date('2026-01-01'),
      updatedAt: null,
      roles: ['ADMIN'],
      behaviorProfile: { accessCount: 10, lastAccessAt: new Date('2026-01-01'), avgRequestsPerHour: 5, uniqueEndpointsCount: 2 }
    },
    {
      id: '2',
      username: 'user2',
      userType: 'VIEWER',
      isActive: false,
      failedAttempts: 3,
      lockedUntil: null,
      createdAt: new Date('2026-01-01'),
      updatedAt: null,
      roles: ['VIEWER'],
      behaviorProfile: { accessCount: 2, lastAccessAt: new Date('2026-01-01'), avgRequestsPerHour: 1, uniqueEndpointsCount: 1 }
    },
  ];

  beforeEach(async () => {
    userServiceMock = {
      LoadUsers: vi.fn().mockReturnValue(of({ page: 1, pageSize: 20, totalRecords: 2, totalPages: 1, data: mockUsers })),
    };

    authServiceMock = {
      isAdmin: true,
      isViewer: false,
    };

    await TestBed.configureTestingModule({
      imports: [ProfileDevicesComponent],
      providers: [
        { provide: ANIMATION_MODULE_TYPE, useValue: 'NoopAnimations' },
        { provide: UserService, useValue: userServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileDevicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. should create profile devices component', () => {
    expect(component).toBeTruthy();
  });

  it('2. should calculate totalUsersCount, activeUsersCount, inactiveUsersCount and failedAttemptsUsersCount correctly', () => {
    component.data.set(mockUsers);
    component.totalRecords.set(2);

    expect(component.totalUsersCount()).toBe(2);
    expect(component.activeUsersCount()).toBe(1);
    expect(component.inactiveUsersCount()).toBe(1);
    expect(component.failedAttemptsUsersCount()).toBe(1);
  });

  it('3. should load users on OnParamsGrid call with valid params', () => {
    component.OnParamsGrid({ page: 1, pageSize: 20 });

    expect(userServiceMock.LoadUsers).toHaveBeenCalled();
    expect(component.data()).toEqual(mockUsers);
    expect(component.totalRecords()).toBe(2);
    expect(component.loading()).toBe(false);
  });

  it('4. should display error message when loadUser fails', () => {
    const msgSpy = vi.spyOn((component as any).msg, 'add');
    userServiceMock.LoadUsers.mockReturnValue(throwError(() => ({ error: { message: 'Server error' } })));
    component.loadUser();

    expect(component.loading()).toBe(false);
    expect(msgSpy).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Server error',
    });
  });

  it('5. should open profile panel when view profile action is triggered', () => {
    component.buttonsOptions[0].action(mockUsers[0]);

    expect(component.selectedUser()).toEqual(mockUsers[0]);
    expect(component.showProfilePanel()).toBe(true);
  });

  it('6. should open user role dialog when edit role action is triggered', () => {
    component.buttonsOptions[1].action(mockUsers[0]);

    expect(component.selectedUser()).toEqual(mockUsers[0]);
    expect(component.showRoleDialog()).toBe(true);
  });

  it('7. should clear filters on limpiarFiltros', () => {
    component.userTypeFilter.set('Admin');
    component.isActiveFilter.set('true');

    component.limpiarFiltros();

    expect(component.userTypeFilter()).toBe('');
    expect(component.isActiveFilter()).toBe('');
    expect(component.filterParams()).toEqual({});
  });

  it('8. should build correct filterParams when userType and isActive filters are set', () => {
    component.userTypeFilter.set('Regular ');
    component.isActiveFilter.set('true');

    expect(component.filterParams()).toEqual({
      userType: 'Regular',
      isActive: true,
    });
  });

  it('9. should handle boolean conversion of false in isActive filter correctly', () => {
    component.isActiveFilter.set('false');
    expect(component.filterParams()).toEqual({
      isActive: false,
    });
  });

  it('10. should reload users when onRoleAssigned is called', () => {
    const spy = vi.spyOn(component, 'loadUser');
    component.onRoleAssigned();
    expect(spy).toHaveBeenCalled();
  });
});
