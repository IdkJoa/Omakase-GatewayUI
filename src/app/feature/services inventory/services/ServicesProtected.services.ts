import { environment } from './../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { paramsGrid } from '../../../shared/layout/interfaces/ParamsGrid';
import { Observable } from 'rxjs';
import {
  AssociatePolicyRequest,
  ServicePolicyDto,
  ServicesAction,
  ServicesResponse,
} from '../interfaces/services-protected.interface';

@Injectable({ providedIn: 'root' })
export class ServiceProtectedService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.API_URL}/services`;

  loadServices(params?: paramsGrid): Observable<ServicesResponse> {
    return this.http.get<ServicesResponse>(this.baseUrl, { params: params });
  }

  createServices(services: ServicesAction): Observable<ServicesResponse> {
    return this.http.post<ServicesResponse>(`${this.baseUrl}`, services);
  }

  updateServices(services: ServicesAction, id: string): Observable<ServicesResponse> {
    return this.http.put<ServicesResponse>(`${this.baseUrl}/${id}`, services);
  }

  deleteServices(id: string): Observable<ServicesResponse> {
    return this.http.delete<ServicesResponse>(`${this.baseUrl}/${id}`);
  }

  getServicePolicies(serviceId: string): Observable<ServicePolicyDto[]> {
    return this.http.get<ServicePolicyDto[]>(`${this.baseUrl}/${serviceId}/policies`);
  }

  associatePolicy(serviceId: string, payload: AssociatePolicyRequest): Observable<ServicePolicyDto> {
    return this.http.post<ServicePolicyDto>(`${this.baseUrl}/${serviceId}/policies`, payload);
  }

  disassociatePolicy(serviceId: string, policyId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${serviceId}/policies/${policyId}`);
  }
}
