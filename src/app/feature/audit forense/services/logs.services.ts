import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs';
import { Logs } from '../interface/logs.interfaces';

@Injectable({ providedIn: 'root' })
export class LogsService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.API_URL}/logs`;

  getLogs(params?: Record<string, string | readonly string[]>): Observable<Logs> {
    return this.http.get<Logs>(this.baseUrl,
      { params: params = {} }
    );
  }

}
