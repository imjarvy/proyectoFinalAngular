export interface AuthUser {
  id: string | number;
  name?: string;
  displayName?: string;
  email: string;
  photoURL?: string | null;
  provider?: string;
  token?: string | null;
  created_at?: string;
  updated_at?: string;
}