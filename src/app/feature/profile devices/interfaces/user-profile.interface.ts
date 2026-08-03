export type VerdictType = 'Allow' | 'Challenge' | 'Block';

export interface RecentAccessDto {
  evaluatedAt: string;
  verdict: VerdictType;
  riskScore: number;
  sourceIp: string;
  country: string | null;
  city: string | null;
}

export interface FeatureVectorDto {
  hourSin: number;
  hourCos: number;
  frequency: number;
  diversity: number;
  typicalHour: number;
}

export interface UserProfileDto {
  userId: string;
  username: string;
  accessCount: number;
  isColdStart: boolean;
  baseRiskPenalty: number;
  lastTrainedAt: string | null;
  featureVector: FeatureVectorDto | null;
  recentAccesses: RecentAccessDto[];
}

export interface MfaStatusDto {
  userId: string;
  username: string;
  mfaEnabled: boolean;
  enrollmentPending: boolean;
  locked: boolean;
  lockedUntil: string | null;
}

export interface MfaEnrollmentResponse {
  provisioningUri: string;
}

export interface MfaEnrollConfirmRequest {
  otp: string;
}
