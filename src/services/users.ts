import { API_BASE_URL } from "@/config/api";
import { tokenManager } from "@/services/auth";
import { UsersResponse, UpdateUserStatusRequest, UserResponse } from "@/types/user";

class UsersService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = tokenManager.getAdminToken();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      headers,
      ...options,
    });

    if (!response.ok) {
      let message = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        message = errorData.message?.en || errorData.message || message;
      } catch {
        // ignore
      }
      throw new Error(message);
    }

    return response.json();
  }

  async getCustomers(offset = 0, limit = 10, isActive?: boolean) {
    const params = new URLSearchParams({
      offset: offset.toString(),
      limit: limit.toString(),
      userType: "CUSTOMER",
    });

    if (typeof isActive === "boolean") {
      params.append("isActive", String(isActive));
    }

    const endpoint = `/users-auth/users?${params.toString()}`;
    return this.request<UsersResponse>(endpoint);
  }

  async updateCustomerStatus(id: number, payload: UpdateUserStatusRequest) {
    const endpoint = `/users-auth/users/${id}/status`;
    return this.request<UserResponse>(endpoint, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }
}

export const usersService = new UsersService();
export default usersService;



