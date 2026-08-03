import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { RolesService } from './roles.service';
import { environment } from '../../../../environments/environment';
import { Role, User } from '../interfaces/roles.interface';
import { PagedResponse } from '../../../shared/layout/interfaces/paged-response.interface';
import { expect } from 'vitest';

describe('RolesService', () => {
  let service: RolesService;
  let httpMock: HttpTestingController;
  const rolesUrl = `${environment.API_URL}/roles`;
  const usersUrl = `${environment.API_URL}/users`;

  const mockRoles: Role[] = [
    { id: 'r-1', name: 'ADMIN', description: 'Administrator', createdAt: '2026-01-01', usersCount: 2 },
    { id: 'r-2', name: 'VIEWER', description: 'Read only', createdAt: '2026-01-01', usersCount: 0 },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RolesService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(RolesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('1. should be created', () => {
    expect(service).toBeTruthy();
  });

  it('2. should fetch roles via getRoles', () => {
    service.getRoles().subscribe((roles) => {
      expect(roles).toEqual(mockRoles);
    });

    const req = httpMock.expectOne(rolesUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockRoles);
  });

  it('3. should create a new role via createRole', () => {
    const newRole = { name: 'OPERATOR', description: 'Operator role' };
    service.createRole(newRole).subscribe((role) => {
      expect(role.id).toBe('r-3');
    });

    const req = httpMock.expectOne(rolesUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newRole);
    req.flush({ id: 'r-3', createdAt: '2026-08-03', usersCount: 0, ...newRole });
  });

  it('4. should update role details via updateRole', () => {
    const updateData = { name: 'SUPER_ADMIN', description: 'Super Admin' };
    service.updateRole('r-1', updateData).subscribe();

    const req = httpMock.expectOne(`${rolesUrl}/r-1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updateData);
    req.flush(null);
  });

  it('5. should delete a role via deleteRole', () => {
    service.deleteRole('r-2').subscribe();

    const req = httpMock.expectOne(`${rolesUrl}/r-2`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('6. should fetch paginated users via getUsers', () => {
    const mockPagedUsers: PagedResponse<User> = {
      page: 1,
      pageSize: 10,
      totalRecords: 1,
      data: [{ id: 'u-1', username: 'john', userType: 'ADMIN', isActive: true, roles: ['r-1'] }]
    };

    service.getUsers(1, 10).subscribe((res) => {
      expect(res.data.length).toBe(1);
    });

    const req = httpMock.expectOne((r) =>
      r.url === usersUrl &&
      r.params.get('page') === '1' &&
      r.params.get('pageSize') === '10'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockPagedUsers);
  });

  it('7. should fetch user assigned roles via getUserRoles', () => {
    service.getUserRoles('u-1').subscribe((roles) => {
      expect(roles).toEqual(mockRoles);
    });

    const req = httpMock.expectOne(`${usersUrl}/u-1/roles`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRoles);
  });

  it('8. should assign role to user via assignRoleToUser', () => {
    service.assignRoleToUser('u-1', 'r-1').subscribe();

    const req = httpMock.expectOne(`${usersUrl}/u-1/roles`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ roleId: 'r-1' });
    req.flush(null);
  });

  it('9. should revoke role from user via revokeRoleFromUser', () => {
    service.revokeRoleFromUser('u-1', 'r-1').subscribe();

    const req = httpMock.expectOne(`${usersUrl}/u-1/roles/r-1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('10. should handle HTTP errors on role assignment gracefully', () => {
    service.assignRoleToUser('u-1', 'invalid-role').subscribe({
      next: () => expect.fail('Should have failed with 404'),
      error: (err) => {
        expect(err.status).toBe(404);
      }
    });

    const req = httpMock.expectOne(`${usersUrl}/u-1/roles`);
    req.flush('Role not found', { status: 404, statusText: 'Not Found' });
  });
});
