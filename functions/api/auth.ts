import { BackendApiUrl } from "../BackendApiUrl";
import { authorizedFetch } from "./authorizedFetch";

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: UserProfile;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  employeeId?: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(BackendApiUrl.userLogin, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  return await response.json();
}

export async function getProfile(): Promise<UserProfile> {
  const response = await authorizedFetch(BackendApiUrl.userProfile);

  if (!response.ok) {
    throw new Error("Failed to fetch user profile");
  }

  return await response.json();
}
