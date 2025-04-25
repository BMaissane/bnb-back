interface CreateUserRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: 'USER' | 'ADMIN'; // Optionnel avec valeurs spécifiques
  }
  
  interface UpdateUserRequest {
    firstName?: string;
    lastName?: string;
    email?: string;
  }
  
  export type { CreateUserRequest, UpdateUserRequest };