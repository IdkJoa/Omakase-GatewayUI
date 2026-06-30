import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { paramsGrid } from '../../../shared/layout/interfaces/ParamsGrid';
import { Observable } from 'rxjs';
import { Policies, PoliciesAction, PoliciesResponse } from '../interfaces/policies.interface';

@Injectable({ providedIn: 'root' })
export class PoliciesService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.API_URL}/policies`;

  LoadPolicies(params: paramsGrid): Observable<PoliciesResponse> {
    return this.http.get<PoliciesResponse>(this.baseUrl, { params: params ?? undefined });
  }

  CreatePolicies(policies: PoliciesAction): Observable<Policies> {
    return this.http.post<Policies>(this.baseUrl, policies);
  }

  UpdatePolicies(policies: PoliciesAction, id: string): Observable<Policies> {
    return this.http.put<Policies>(`${this.baseUrl}/${id}`, policies);
  }

  DeletePolicies(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.baseUrl}/${id}`);
  }
}
