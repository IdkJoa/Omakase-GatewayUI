export interface PoliciesResponse {
  page: number;
  pageSize: number;
  totalRecords: number;
  data: Policies[];
  totalPages: number;
}

export type PolicyType = 'Geofence' | 'Timewindow' | 'Fingerprint' | 'impossibleTravel';

export enum PolicyTypeEnum {
  Geofence = 'Geofence',
  Timewindow = 'Timewindow',
  Fingerprint = 'Fingerprint',
  ImpossibleTravel = 'impossibleTravel',
}

export interface PolicyTypeOption {
  label: string;
  value: PolicyType;
}

export const POLICY_TYPES: PolicyTypeOption[] = [
  { label: 'Geofence', value: 'Geofence' },
  { label: 'Timewindow', value: 'Timewindow' },
  { label: 'Fingerprint', value: 'Fingerprint' },
  { label: 'impossibleTravel', value: 'impossibleTravel' },
];

export interface Config {
  allowed_countries?: string[];
  allowedCountries?: string[];
  denied_countries?: string[];
  start_time?: string;
  end_time?: string;
  startHour?: number;
  endHour?: number;
  daysOfWeek?: any[];
  maxSpeedKmh?: number;
  maxDevicesPerSession?: number;
  timezone?: string;
  [key: string]: any;
}

export interface Policies {
  id: string;
  name: string;
  type: PolicyType | string;
  config: Config;
  weight: number;
  isActive: boolean;
  createdById: string;
  createdByUsername: string;
  createdAt: Date;
}

export interface PoliciesAction {
  name: string;
  type: PolicyType | string;
  config: Config | Record<string, any> | string;
  weight: number;
  isActive: boolean;
}
