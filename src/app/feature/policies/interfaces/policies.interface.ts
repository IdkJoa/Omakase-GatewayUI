export interface PoliciesResponse {
  page: number;
  pageSize: number;
  totalRecords: number;
  data: Policies[];
  totalPages: number;
}

export interface Policies {
  id: string;
  name: string;
  type: string;
  config: Config;
  weight: number;
  isActive: boolean;
  createdById: string;
  createdByUsername: string;
  createdAt: Date;
}

export interface Config {
  allowedCountries?: string[];
  startHour?: number;
  endHour?: number;
  daysOfWeek?: number[];
  maxSpeedKmh?: number;
  maxDevicesPerSession?: number;
}


export interface PoliciesAction {
  name: string;
  type: string;
  config: string;
  weight: number;
  isActive: boolean;
}

