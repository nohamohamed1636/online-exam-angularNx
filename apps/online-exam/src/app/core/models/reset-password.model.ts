export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface ResetPasswordValidationError {
  path: string;
  messages?: string[];
  message?: string;
}

export interface ResetPasswordErrorResponse {
  status: boolean;
  code: number;
  message: string;
  errors?: ResetPasswordValidationError[];
}
