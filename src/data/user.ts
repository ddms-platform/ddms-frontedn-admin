export type UserRole = 'user' | 'owner' | 'admin';

export interface User {
  name: string;
  email: string;
  roles: UserRole[];
  avatar_url?: string;
}
