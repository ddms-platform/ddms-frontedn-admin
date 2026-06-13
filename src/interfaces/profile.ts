export interface IProfileRes {
  id: string;
  fullName: string;
  email: string;
  roles: string[];
  emailVerified: boolean;
  phone?: string;
  address?: string;
  avatarUrl?: string;
  hasOwnerProfile: boolean;
}
