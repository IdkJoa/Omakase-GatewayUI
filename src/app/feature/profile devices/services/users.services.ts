import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { paramsGrid } from '../../../shared/layout/interfaces/ParamsGrid';
import { Observable } from 'rxjs';
import { ProfileResponse } from '../interfaces/profile-devices.interface';
import {
  UserProfileDto,
  MfaStatusDto,
  MfaEnrollmentResponse,
} from '../interfaces/user-profile.interface';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.API_URL}/users`;

  LoadUsers(params: paramsGrid | null | undefined): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(this.baseUrl, { params: params ?? undefined });
  }

  getUserProfile(userId: string): Observable<UserProfileDto> {
    return this.http.get<UserProfileDto>(`${this.baseUrl}/${userId}/profile`);
  }

  getMfaStatus(userId: string): Observable<MfaStatusDto> {
    return this.http.get<MfaStatusDto>(`${this.baseUrl}/${userId}/mfa`);
  }

  enrollMfa(userId: string): Observable<MfaEnrollmentResponse> {
    return this.http.post<MfaEnrollmentResponse>(`${this.baseUrl}/${userId}/mfa/enroll`, {});
  }

  confirmMfaEnrollment(userId: string, otp: string): Observable<MfaStatusDto> {
    return this.http.post<MfaStatusDto>(`${this.baseUrl}/${userId}/mfa/enroll/confirm`, { otp });
  }

  resetMfa(userId: string): Observable<MfaStatusDto> {
    return this.http.post<MfaStatusDto>(`${this.baseUrl}/${userId}/mfa/reset`, {});
  }
}
