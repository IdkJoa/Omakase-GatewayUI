import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Metrics } from '../interfaces/dashboard.interface';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.API_URL}`


  getMetrics(): Observable<Metrics> {
    return this.http.get<Metrics>(`${this.baseUrl}/metrics/summary`);
  }
}
