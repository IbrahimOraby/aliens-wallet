export interface User {
  id: number;
  email: string;
  name: string;
  phoneNumber: string | null;
  photoUrl: string | null;
  userType: "ADMIN" | "CUSTOMER";
  isActive: boolean;
  twofaEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UsersResponse {
  success: boolean;
  data: User[];
  meta: {
    total: number;
    offset: number;
    limit: number;
  };
}

export interface UserResponse {
  success: boolean;
  data: User;
  message?: {
    en?: string;
    ar?: string;
  };
}

export interface UpdateUserStatusRequest {
  isActive: boolean;
}



