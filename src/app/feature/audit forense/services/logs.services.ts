import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs';
import { Logs } from '../interface/logs.interfaces';

import { paramsGrid } from '../../../shared/layout/interfaces/ParamsGrid';

@Injectable({ providedIn: 'root' })
export class LogsService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.API_URL}/logs`;

  getLogs(params?: paramsGrid): Observable<Logs> {
    return this.http.get<Logs>(this.baseUrl,
      { params: params ?? undefined }
    );
  }

}
