// Input validation utilities

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email: unknown): email is string => {
  return typeof email === 'string' && EMAIL_REGEX.test(email.trim());
};

export const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

export const isValidId = (id: unknown): id is string => {
  return typeof id === 'string' && id.length > 0;
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export const sanitizeText = (text: string): string => {
  return text
    .trim()
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, ''); // Remove any remaining angle brackets
};

export const MAX_POST_LENGTH = 280;
export const MAX_FAILED_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
