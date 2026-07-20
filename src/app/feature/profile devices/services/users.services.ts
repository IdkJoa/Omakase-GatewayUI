import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { paramsGrid } from '../../../shared/layout/interfaces/ParamsGrid';
import { Observable } from 'rxjs';
import { ProfileResponse } from '../interfaces/profile-devices.interface';

@Injectable({providedIn: 'root'})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.API_URL}/users`;

  LoadUsers(params: paramsGrid | null | undefined) : Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(this.baseUrl, {params: params ?? undefined});
  }


}
