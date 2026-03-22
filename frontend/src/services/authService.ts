import jwtDecode from 'jwt-decode';

interface DecodedToken {
  exp: number;
  user_id: string;
  role: string;
  [key: string]: any;
}

/**
 * Get the auth token from storage
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

/**
 * Set the auth token in storage
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

/**
 * Remove the auth token from storage
 */
export const removeAuthToken = (): void => {
  localStorage.removeItem('auth_token');
};

/**
 * Check if the user is authenticated
 * Verifies token existence and expiration
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = getAuthToken();

    if (!token) {
      return false;
    }

    // Decode the token to check expiration
    const decodedToken = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;

    if (decodedToken.exp < currentTime) {
      // Token is expired, remove it and return false
      removeAuthToken();
      return false;
    }

    // Optional: Validate token with backend
    // const response = await fetch('/api/auth/verify', {
    //   headers: { Authorization: `Bearer ${token}` }
    // });
    // return response.ok;

    return true;
  } catch (error) {
    console.error("Authentication check failed:", error);
    removeAuthToken();
    return false;
  }
};

/**
 * Get the current user's ID from the token
 */
export const getUserId = (): string | null => {
  try {
    const token = getAuthToken();

    if (!token) {
      return null;
    }

    const decodedToken = jwtDecode<DecodedToken>(token);
    return decodedToken.user_id;
  } catch (error) {
    console.error("Failed to get user ID:", error);
    return null;
  }
};

/**
 * Get the current user's role from the token
 */
export const getUserRole = (): string | null => {
  try {
    const token = getAuthToken();

    if (!token) {
      return null;
    }

    const decodedToken = jwtDecode<DecodedToken>(token);
    return decodedToken.role;
  } catch (error) {
    console.error("Failed to get user role:", error);
    return null;
  }
};

/**
 * Check if the current user has a specific role
 */
export const hasRole = (requiredRole: string): boolean => {
  const role = getUserRole();
  return role === requiredRole;
};
