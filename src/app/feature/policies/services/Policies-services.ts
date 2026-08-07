import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { paramsGrid } from '../../../shared/layout/interfaces/ParamsGrid';
import { Observable } from 'rxjs';
import { Policies, PoliciesAction, PoliciesResponse } from '../interfaces/policies.interface';

@Injectable({ providedIn: 'root' })
export class PoliciesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.API_URL}/policies`;

  loadPolicies(params?: paramsGrid): Observable<PoliciesResponse> {
    return this.http.get<PoliciesResponse>(this.baseUrl, { params: params ?? undefined });
  }

  createPolicies(policies: PoliciesAction): Observable<Policies> {
    return this.http.post<Policies>(this.baseUrl, policies);
  }

  updatePolicies(policies: PoliciesAction, id: string): Observable<Policies> {
    return this.http.put<Policies>(`${this.baseUrl}/${id}`, policies);
  }

  deletePolicies(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.baseUrl}/${id}`);
  }
}
