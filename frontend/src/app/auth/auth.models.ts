export type UserRole = 'admin' | 'member';

export interface User {
  id: number;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  access_token: string;
  token_type: 'bearer';
}
