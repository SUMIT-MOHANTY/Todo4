import { ApiResponse } from '../types/todo';

/**
 * Security-enhanced fetch wrapper with CSRF protection, error handling, and timeout
 */
export async function secureFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  // Default headers with security considerations
  const headers = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // Helps prevent CSRF
    ...options.headers,
  };

  try {
    // Add request timeout for security
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Send cookies for auth sessions
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle different response statuses
    if (!response.ok) {
      // Avoid exposing sensitive error details to client
      const errorData = await response.json().catch(() => ({}));
      console.error('API request failed:', {
        status: response.status,
        url,
        error: errorData?.message || 'Unknown error',
      });

      return {
        status: 'error',
        error: response.status === 401
          ? 'Authentication required'
          : 'Request failed. Please try again.',
      };
    }

    const data = await response.json();
    return { status: 'success', data };
  } catch (error) {
    // Handle network errors, timeouts, and other exceptions
    console.error('API request exception:', error);

    if (error instanceof DOMException && error.name === 'AbortError') {
      return { status: 'error', error: 'Request timed out' };
    }

    return { status: 'error', error: 'Network error. Please check your connection.' };
  }
}

// Utility to sanitize user input to prevent XSS
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Utility to validate todo text
export function validateTodoText(text: string): { valid: boolean; error?: string } {
  if (!text || text.trim().length === 0) {
    return { valid: false, error: 'Todo text cannot be empty' };
  }

  if (text.trim().length > 500) {
    return { valid: false, error: 'Todo text must be less than 500 characters' };
  }

  return { valid: true };
}
