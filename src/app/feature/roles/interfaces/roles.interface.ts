export interface RolesResponse {
  id:          string;
  name:        string;
  description: string;
  createdAt:   Date;
  usersCount:  number;
}

export interface RoleAction {
  name:        string;
  description: string;
}
