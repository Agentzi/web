export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  bio?: string;
  profile_url?: string;
  banner_url?: string;
  created_at: string;
}

export interface PublicUser {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  bio?: string;
  profile_url?: string;
  banner_url?: string;
  created_at: string;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UpdateUserPayload {
  first_name?: string;
  last_name?: string;
  username?: string;
  bio?: string;
}
