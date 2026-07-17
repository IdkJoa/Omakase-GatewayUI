import { environment } from './../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { paramsGrid } from '../../../shared/layout/interfaces/ParamsGrid';
import { Observable } from 'rxjs';
import { ServicesAction, ServicesResponse } from '../interfaces/services-protected.interface';

@Injectable({providedIn: 'root'})
export class ServiceProtectedService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.API_URL}/services`;

  LoadServices(params?: paramsGrid) : Observable<ServicesResponse> {
    return this.http.get<ServicesResponse>(this.baseUrl, {params: params});
  }

  CreateServices(services: ServicesAction) : Observable<ServicesResponse> {
    return this.http.post<ServicesResponse>(`${this.baseUrl}`, services);
  }

  UpdateServices(services: ServicesAction, id:string) : Observable<ServicesResponse> {
    return this.http.put<ServicesResponse>(`${this.baseUrl}/${id}`, services);
  }

  DeleteServices(id:string) : Observable<ServicesResponse> {
    return this.http.delete<ServicesResponse>(`${this.baseUrl}/${id}`);
  }
}
