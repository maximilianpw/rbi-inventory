/**
 * Clerk error classification for better user experience
 * Categorizes authentication errors and determines if they're retryable
 */

export enum ClerkErrorType {
  TOKEN_EXPIRED = 'token_expired',
  TOKEN_INVALID = 'token_invalid',
  TOKEN_MISSING = 'token_missing',
  NETWORK_ERROR = 'network_error',
  CONFIGURATION_ERROR = 'configuration_error',
  UNKNOWN_ERROR = 'unknown_error',
}

export interface ClassifiedError {
  type: ClerkErrorType;
  message: string;
  retryable: boolean;
  originalError?: string;
}

/**
 * Classifies Clerk authentication errors into user-friendly categories
 */
export function classifyClerkError(error: any): ClassifiedError {
  const errorMessage = error?.message || error?.toString() || 'Unknown error';
  const errorString = errorMessage.toLowerCase();

  // Token expired
  if (
    errorString.includes('expired') ||
    errorString.includes('exp') ||
    errorString.includes('token has expired')
  ) {
    return {
      type: ClerkErrorType.TOKEN_EXPIRED,
      message: 'Your session has expired. Please sign in again.',
      retryable: false,
      originalError: errorMessage,
    };
  }

  // Token invalid (malformed, wrong signature, etc.)
  if (
    errorString.includes('invalid') ||
    errorString.includes('malformed') ||
    errorString.includes('signature') ||
    errorString.includes('jwt')
  ) {
    return {
      type: ClerkErrorType.TOKEN_INVALID,
      message: 'Authentication token is invalid. Please sign in again.',
      retryable: false,
      originalError: errorMessage,
    };
  }

  // Token missing
  if (
    errorString.includes('missing') ||
    errorString.includes('no token') ||
    errorString.includes('authorization header')
  ) {
    return {
      type: ClerkErrorType.TOKEN_MISSING,
      message: 'Authentication required. Please provide a valid token.',
      retryable: false,
      originalError: errorMessage,
    };
  }

  // Network/connectivity errors
  if (
    errorString.includes('network') ||
    errorString.includes('timeout') ||
    errorString.includes('econnrefused') ||
    errorString.includes('enotfound') ||
    error?.code === 'ECONNREFUSED' ||
    error?.code === 'ETIMEDOUT'
  ) {
    return {
      type: ClerkErrorType.NETWORK_ERROR,
      message:
        'Unable to verify authentication. Please try again in a moment.',
      retryable: true,
      originalError: errorMessage,
    };
  }

  // Configuration errors (missing secret key, etc.)
  if (
    errorString.includes('configuration') ||
    errorString.includes('secret') ||
    errorString.includes('api key') ||
    errorString.includes('clerk_secret_key')
  ) {
    return {
      type: ClerkErrorType.CONFIGURATION_ERROR,
      message: 'Authentication service is misconfigured. Please contact support.',
      retryable: false,
      originalError: errorMessage,
    };
  }

  // Unknown error
  return {
    type: ClerkErrorType.UNKNOWN_ERROR,
    message: 'Authentication failed. Please try again or contact support.',
    retryable: true,
    originalError: errorMessage,
  };
}
