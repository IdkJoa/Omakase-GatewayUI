export interface Role {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  usersCount: number;
}

export interface User {
  id: string;
  username: string;
  userType: string;
  isActive: boolean;
  roles: string[];
}

export interface PagedResponse<T> {
  page: number;
  pageSize: number;
  totalRecords: number;
  data: T[];
}

export interface RolesResponse {
  id:          string;
  name:        string;
  description: string;
  createdAt:   Date | string;
  usersCount:  number;
}

export interface RoleAction {
  name:        string;
  description: string;
}
