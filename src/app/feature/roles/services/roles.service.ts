import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs';
import { Role, User } from '../interfaces/roles.interface';
import { PagedResponse } from '../../../shared/layout/interfaces/paged-response.interface';

@Injectable({ providedIn: 'root' })
export class RolesService {
  private readonly http = inject(HttpClient);
  private readonly rolesUrl = `${environment.API_URL}/roles`;
  private readonly usersUrl = `${environment.API_URL}/users`;

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.rolesUrl);
  }

  createRole(role: { name: string; description?: string }): Observable<Role> {
    return this.http.post<Role>(this.rolesUrl, role);
  }

  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.rolesUrl}/${id}`);
  }

  updateRole(id: string, role: { name: string; description?: string }): Observable<void> {
    return this.http.put<void>(`${this.rolesUrl}/${id}`, role);
  }

  getUsers(page: number = 1, pageSize: number = 100): Observable<PagedResponse<User>> {
    return this.http.get<PagedResponse<User>>(this.usersUrl, {
      params: { page: page.toString(), pageSize: pageSize.toString() }
    });
  }

  getUserRoles(userId: string): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.usersUrl}/${userId}/roles`);
  }

  assignRoleToUser(userId: string, roleId: string): Observable<void> {
    return this.http.post<void>(`${this.usersUrl}/${userId}/roles`, { roleId });
  }

  revokeRoleFromUser(userId: string, roleId: string): Observable<void> {
    return this.http.delete<void>(`${this.usersUrl}/${userId}/roles/${roleId}`);
  }
}
