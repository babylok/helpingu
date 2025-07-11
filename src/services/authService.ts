import axios, { AxiosError } from 'axios';
import { User } from "@/types/User";
import { setUser, setToken, clearAuth } from "@/utils/authUtils";
import baseUrl from "@/contexts/BaseUrl";

const api = axios.create({
 
  baseURL: `${baseUrl}/api/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials extends LoginCredentials {
  name: string;
  role: "passenger" | "driver";
  phoneNumber: string;
  countryCode: string;
}

export async function isTokenValid(token: string | null): Promise<boolean> {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp > Date.now() / 1000;
  } catch (error) {
    return false;
  }
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    console.log('Attempting login with:', { email: credentials.email, password: '***' });
    const response = await api.post('/login', {
      email: credentials.email,
      password: credentials.password
    });
    
    if (!response.data || !response.data.token || !response.data.user) {
      throw new Error('Invalid response format from server');
    }
    
    console.log('Login successful, received response:', response.data);
    const { token, user } = response.data;
    setToken(token);
    setUser(user);
    console.log('User data saved:', user);
    return { token, user };
  } catch (error: unknown) {
    console.error('Login error:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error response:', error.response?.data);
      throw new Error(error.response?.data?.message || 
        error.response?.statusText || 
        'Login failed');
    }
    throw new Error('Network error: ' + (error instanceof Error ? error.message : 'Unknown error occurred'));
  }
};

export const signUp = async (credentials: SignUpCredentials): Promise<AuthResponse> => {
  try {
    const response = await api.post('/register', {
      ...credentials,
      phone: `${credentials.countryCode}${credentials.phoneNumber}`
    });
    const { token, user } = response.data;
    setToken(token);
    setUser(user);
    console.log('User data saved:', user);
    return { token, user };
  } catch (error) {
    const axiosError = error as unknown as AxiosError<{ message: string }>;
    throw new Error(axiosError.response?.data?.message || 'Sign up failed');
  }
};

export const logout = () => {
 
  clearAuth();
};
