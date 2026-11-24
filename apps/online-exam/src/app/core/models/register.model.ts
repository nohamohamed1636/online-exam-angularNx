
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface RegisterResponse {
  status: boolean;
  code: number;
  message: string;
}

export interface RegisterValidationError {
  path: string;
  message?: string;
  messages?: string[];
}

export interface RegisterErrorResponse {
  status: boolean;
  code: number;
  message: string;
  errors?: RegisterValidationError[];
}
