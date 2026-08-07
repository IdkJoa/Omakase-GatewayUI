export interface ServicesResponse {
  page: number;
  pageSize: number;
  totalRecords: number;
  data: Services[];
  totalPages: number;
}

export interface Services {
  id: string;
  name: string;
  upstreamUrl: string;
  requiresAuth: boolean;
  isActive: boolean;
  createdAt: Date;
  associatedPoliciesCount: number;
}

export interface ServicesAction {
  name: string;
  upstreamUrl: string;
  requiresAuth: boolean;
  isActive: boolean;
}

export type PolicyType = 'Geofence' | 'TimeWindow' | 'Fingerprint' | 'ImpossibleTravel';

export interface ServicePolicyDto {
  id: string;
  policyId: string;
  policyName: string;
  policyType: PolicyType;
  weight: number;
  isEnabled: boolean;
  policyIsActive: boolean;
}

export interface AssociatePolicyRequest {
  policyId: string;
  isEnabled?: boolean;
}
