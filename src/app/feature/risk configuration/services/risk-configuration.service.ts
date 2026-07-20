import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { RiskConfigurationRequest, RiskConfigurationResponse } from '../interfaces/risk-configuration.interface';

@Injectable({ providedIn: 'root' })
export class RiskConfigurationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.API_URL}/risk-config`;

  getRiskConfig(): Observable<RiskConfigurationResponse> {
    return this.http.get<RiskConfigurationResponse>(this.baseUrl);
  }

  updateRiskConfig(config: RiskConfigurationRequest): Observable<RiskConfigurationResponse> {
    return this.http.put<RiskConfigurationResponse>(this.baseUrl, config);
  }
}
