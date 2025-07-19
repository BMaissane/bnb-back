export class AppError extends Error {
  constructor(message: string, public statusCode: number = 400) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Non autorisé') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Accès refusé') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Ressource non trouvée') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

export class BusinessRuleError extends AppError {
  constructor(message: string = 'Règle métier non respectée') {
    super(message, 422);
    this.name = 'BusinessRuleError';
  }
}