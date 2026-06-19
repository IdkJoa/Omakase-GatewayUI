export interface ProfileResponse {
  page: number;
  pageSize: number;
  totalRecords: number;
  data: ProfileDevices[];
  totalPages: number;
}

export interface ProfileDevices {
  id: string;
  username: string;
  userType: string;
  isActive: boolean;
  failedAttempts: number;
  lockedUntil: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
  roles: string[];
  behaviorProfile: BehaviorProfile;
}

export interface BehaviorProfile {
  accessCount: number;
  lastAccessAt: Date;
  avgRequestsPerHour: number;
  uniqueEndpointsCount: number;
}
