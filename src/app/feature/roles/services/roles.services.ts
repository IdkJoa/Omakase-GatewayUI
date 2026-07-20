import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs';
import { RoleAction, RolesResponse } from '../interfaces/roles.interface';

@Injectable({providedIn: 'root'})
export class RolesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.API_URL}/roles`;


  LoadRoles() : Observable<RolesResponse[]> {
    return this.http.get<RolesResponse[]>(this.baseUrl);
  }

  CreateRole(role: RoleAction): Observable<RolesResponse> {
    return this.http.post<RolesResponse>(this.baseUrl, role);
  }

  LoadRolById(id: string): Observable<RolesResponse> {
    return this.http.get<RolesResponse>(`${this.baseUrl}/${id}`);
  }

  DeleteRol(id: string) : Observable<boolean>{
    return this.http.delete<boolean>(`${this.baseUrl}/${id}`);
  }

  AssigmentRol(idRol: string, userId: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.baseUrl}/${idRol}/users`, { userId });
  }

  UnassigmentRol(idRol: string, userId:string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.baseUrl}/${idRol}/users/${userId}`);
  }
}
