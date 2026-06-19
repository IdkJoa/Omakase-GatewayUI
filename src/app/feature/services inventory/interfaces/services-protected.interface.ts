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
