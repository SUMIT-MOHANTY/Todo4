// Client-side security middleware
import { Todo } from '../types/todo';

export interface RequestOptions {
  requireAuth?: boolean;
  csrfProtection?: boolean;
  rateLimit?: boolean;
  contentValidation?: (content: any) => boolean;
}

/**
 * Security middleware to enhance API requests with security features
 */
export const enhanceRequestWithSecurity = (
  request: RequestInit,
  options: RequestOptions = {}
): RequestInit => {
  const enhancedRequest = { ...request };

  // Ensure headers object exists
  if (!enhancedRequest.headers) {
    enhancedRequest.headers = {};
  }

  // Add CSRF protection
  if (options.csrfProtection) {
    // Get CSRF token from meta tag
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken) {
      (enhancedRequest.headers as Record<string, string>)['X-CSRF-Token'] = csrfToken;
    }
  }

  // Add request ID for tracing
  (enhancedRequest.headers as Record<string, string>)['X-Request-ID'] = generateRequestId();

  // Ensure credentials are included for auth
  if (options.requireAuth) {
    enhancedRequest.credentials = 'include';
  }

  return enhancedRequest;
};

// Validate todo content for security
export const validateTodoContent = (todo: Partial<Todo>): boolean => {
  // Check for script tags or suspicious content
  if (todo.text && (
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/i.test(todo.text) ||
    /javascript:/i.test(todo.text) ||
    /data:/i.test(todo.text) ||
    /on\w+=/i.test(todo.text)
  )) {
    console.error('Security validation failed: Potentially malicious content detected');
    return false;
  }

  // Validate text length
  if (todo.text && (todo.text.length === 0 || todo.text.length > 500)) {
    return false;
  }

  return true;
};

// Generate unique request ID
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Function to detect XSS attempts
export const detectXSSAttempt = (input: string): boolean => {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/i,
    /javascript:/i,
    /onerror=/i,
    /onclick=/i,
    /onload=/i,
    /onmouseover=/i,
    /onfocus=/i,
    /onblur=/i,
    /eval\(/i,
    /alert\(/i,
    /prompt\(/i,
    /confirm\(/i,
    /document\.cookie/i,
    /document\.location/i,
    /document\.write/i
  ];

  return xssPatterns.some(pattern => pattern.test(input));
};
