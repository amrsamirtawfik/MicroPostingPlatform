// Domain-specific error classes for clean error handling

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class InvalidCredentialsError extends AppError {
  constructor() {
    super('Invalid email or password', 'INVALID_CREDENTIALS', 401);
    this.name = 'InvalidCredentialsError';
  }
}

export class InvalidInputError extends AppError {
  constructor(message: string = 'Invalid input provided') {
    super(message, 'INVALID_INPUT', 400);
    this.name = 'InvalidInputError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'You do not have permission to perform this action') {
    super(message, 'FORBIDDEN', 403);
    this.name = 'ForbiddenError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed') {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class AccountLockedError extends AppError {
  constructor() {
    super('Account is temporarily locked. Please try again later.', 'ACCOUNT_LOCKED', 423);
    this.name = 'AccountLockedError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'UnauthorizedError';
  }
}
