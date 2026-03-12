export type UserRole = "cliente" | "dono" | "tosador" | "super_admin";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  role: UserRole;
  petShopId?: string;  // preenchido para dono/tosador
  createdAt: string;
  lastLogin?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ReferralInfo {
  code: string;
  invitesSent: number;
  rewardsEarned: number;
  shareUrl: string;
}
