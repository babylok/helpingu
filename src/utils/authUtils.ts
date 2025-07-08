import { User } from "@/types/User";

export const getToken = () => {
  return localStorage.getItem('token');
};

export const getUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const setUser = (user: User | null) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
    console.log('User set in localStorage:', user);
  } else {
    localStorage.removeItem('user');
    console.log('User removed from localStorage');
  }
};

export const setToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('token', token);
    console.log('Token set in localStorage:', token);
  } else {
    localStorage.removeItem('token');
    console.log('Token removed from localStorage');
  }
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('currentTrip');
};

export const isTokenValid = () => {
  const token = getToken();
  if (!token) return false;
  // Add token validation logic here
  return true;
};
