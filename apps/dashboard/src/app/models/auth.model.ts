export interface AuthUser {
  id: string;
  email: string;
  role: string;
  organizationId: string;
}

export interface AuthResponse {
  access_token: string;
  user: AuthUser;
}

export interface LoginRequest {
  email: string;
  password: string;
}
